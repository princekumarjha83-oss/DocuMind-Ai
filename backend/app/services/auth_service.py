from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_secure_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.preference import UserPreference
from app.models.session import UserSession
from app.models.token import EmailVerificationToken, PasswordResetToken
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    GenericResponse,
    ResetPasswordRequest,
    UserLoginRequest,
    UserRegisterRequest,
)
from app.schemas.user import UserProfileResponse
from app.services.email_service import email_service

class AuthService:
    @staticmethod
    async def register(db: AsyncSession, register_data: UserRegisterRequest) -> Tuple[User, str]:
        """Register a new user account with Argon2id hashing and email verification token."""
        normalized_email = register_data.email.strip().lower()

        # Check existing user
        result = await db.execute(select(User).where(User.email == normalized_email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists."
            )

        # Hash password securely using Argon2id
        hashed_password = get_password_hash(register_data.password)

        new_user = User(
            full_name=register_data.name.strip(),
            email=normalized_email,
            password_hash=hashed_password,
            is_email_verified=not settings.REQUIRE_EMAIL_VERIFICATION,
            is_active=True,
            plan="free",
            role="member"
        )
        db.add(new_user)
        await db.flush()

        # Initialize default user preferences
        preference = UserPreference(
            user_id=new_user.id,
            theme="dark",
            language="en",
            email_notifications=True,
            zero_retention_acknowledged=True
        )
        db.add(preference)

        # Generate single-use verification token
        raw_token = generate_secure_token()
        token_hash = hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)

        verification_record = EmailVerificationToken(
            user_id=new_user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False
        )
        db.add(verification_record)
        await db.commit()
        await db.refresh(new_user)

        # Send verification email asynchronously / via service
        email_service.send_verification_email(
            to_email=new_user.email,
            name=new_user.full_name,
            token=raw_token
        )

        return new_user, raw_token

    @staticmethod
    async def login(
        db: AsyncSession,
        login_data: UserLoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[AuthResponse, str]:
        """Authenticate credentials, verify status, and create real session."""
        normalized_email = login_data.email.strip().lower()

        result = await db.execute(select(User).where(User.email == normalized_email))
        user = result.scalar_one_or_none()

        # Generic authentication failure message to prevent account enumeration
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Please contact support."
            )

        if settings.REQUIRE_EMAIL_VERIFICATION and not user.is_email_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email verification required before signing in. Please check your inbox or request a new link."
            )

        # Update last login timestamp
        user.last_login_at = datetime.now(timezone.utc)

        # Create session tokens
        raw_session_token = generate_secure_token()
        session_token_hash = hash_token(raw_session_token)

        raw_refresh_token = generate_secure_token()
        refresh_token_hash = hash_token(raw_refresh_token)

        expiry_days = settings.REFRESH_TOKEN_EXPIRE_DAYS if login_data.remember_me else 7
        session_expiry = datetime.now(timezone.utc) + timedelta(days=expiry_days)

        session = UserSession(
            user_id=user.id,
            session_token_hash=session_token_hash,
            refresh_token_hash=refresh_token_hash,
            expires_at=session_expiry,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(session)
        await db.commit()
        await db.refresh(user)

        # Create short-lived JWT access token
        access_token = create_access_token(subject=user.id)

        user_profile = UserProfileResponse(
            id=user.id,
            name=user.full_name,
            email=user.email,
            plan=user.plan,
            role=user.role,
            is_email_verified=user.is_email_verified,
            is_active=user.is_active,
            created_at=user.created_at
        )

        response = AuthResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_profile
        )

        return response, raw_session_token

    @staticmethod
    async def logout(db: AsyncSession, session_token: Optional[str]) -> None:
        """Revoke current active session."""
        if not session_token:
            return
        token_hash = hash_token(session_token)
        await db.execute(
            update(UserSession)
            .where(UserSession.session_token_hash == token_hash)
            .values(is_revoked=True)
        )
        await db.commit()

    @staticmethod
    async def logout_all(db: AsyncSession, user_id: str) -> None:
        """Revoke all sessions for the given user."""
        await db.execute(
            update(UserSession)
            .where(UserSession.user_id == user_id)
            .values(is_revoked=True)
        )
        await db.commit()

    @staticmethod
    async def verify_email(db: AsyncSession, raw_token: str) -> GenericResponse:
        """Verify token and mark user account as verified."""
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)

        result = await db.execute(
            select(EmailVerificationToken)
            .where(
                EmailVerificationToken.token_hash == token_hash,
                EmailVerificationToken.is_used == False
            )
        )
        record = result.scalar_one_or_none()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification link is invalid or has already been used."
            )

        # Check expiration
        record_expiry = record.expires_at
        if record_expiry.tzinfo is None:
            record_expiry = record_expiry.replace(tzinfo=timezone.utc)

        if record_expiry < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification link has expired. Please request a new verification email."
            )

        # Mark token used
        record.is_used = True

        # Activate user email verification
        await db.execute(
            update(User)
            .where(User.id == record.user_id)
            .values(is_email_verified=True)
        )
        await db.commit()

        return GenericResponse(
            success=True,
            message="Your email address has been successfully verified! You can now access your workspace."
        )

    @staticmethod
    async def resend_verification(db: AsyncSession, email: str) -> GenericResponse:
        """Generate a new verification token and email it."""
        normalized_email = email.strip().lower()
        result = await db.execute(select(User).where(User.email == normalized_email))
        user = result.scalar_one_or_none()

        # Always return generic message to prevent account enumeration
        generic_msg = "If an eligible account exists, a new verification link has been dispatched."

        if not user or user.is_email_verified:
            return GenericResponse(success=True, message=generic_msg)

        raw_token = generate_secure_token()
        token_hash = hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS)

        verification_record = EmailVerificationToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False
        )
        db.add(verification_record)
        await db.commit()

        email_service.send_verification_email(
            to_email=user.email,
            name=user.full_name,
            token=raw_token
        )

        return GenericResponse(success=True, message=generic_msg)

    @staticmethod
    async def request_password_reset(db: AsyncSession, email: str) -> GenericResponse:
        """Create single-use password reset token and send email."""
        normalized_email = email.strip().lower()
        result = await db.execute(select(User).where(User.email == normalized_email))
        user = result.scalar_one_or_none()

        generic_msg = "If an account exists for this email, you will receive password reset instructions."

        if not user or not user.is_active:
            return GenericResponse(success=True, message=generic_msg)

        raw_token = generate_secure_token()
        token_hash = hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)

        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False
        )
        db.add(reset_record)
        await db.commit()

        email_service.send_password_reset_email(
            to_email=user.email,
            name=user.full_name,
            token=raw_token
        )

        return GenericResponse(success=True, message=generic_msg)

    @staticmethod
    async def reset_password(db: AsyncSession, reset_data: ResetPasswordRequest) -> GenericResponse:
        """Validate reset token and set new password with Argon2id."""
        if reset_data.confirm_password and reset_data.new_password != reset_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match."
            )

        token_hash = hash_token(reset_data.token)
        now = datetime.now(timezone.utc)

        result = await db.execute(
            select(PasswordResetToken)
            .where(
                PasswordResetToken.token_hash == token_hash,
                PasswordResetToken.is_used == False
            )
        )
        record = result.scalar_one_or_none()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token is invalid or has already been used."
            )

        record_expiry = record.expires_at
        if record_expiry.tzinfo is None:
            record_expiry = record_expiry.replace(tzinfo=timezone.utc)

        if record_expiry < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset link has expired. Please request a new link."
            )

        # Mark token used
        record.is_used = True

        # Hash new password with Argon2id
        new_hash = get_password_hash(reset_data.new_password)

        # Update password
        await db.execute(
            update(User)
            .where(User.id == record.user_id)
            .values(password_hash=new_hash)
        )

        # Invalidate all prior sessions for security
        await AuthService.logout_all(db, record.user_id)
        await db.commit()

        return GenericResponse(
            success=True,
            message="Your password has been successfully reset! Please sign in with your new credentials."
        )

    @staticmethod
    async def change_password(db: AsyncSession, user: User, change_data: ChangePasswordRequest) -> GenericResponse:
        """Change password after verifying the user's current password."""
        if not verify_password(change_data.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect."
            )

        if change_data.confirm_password and change_data.new_password != change_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New passwords do not match."
            )

        new_hash = get_password_hash(change_data.new_password)
        user.password_hash = new_hash
        await db.commit()

        return GenericResponse(
            success=True,
            message="Your password has been updated successfully."
        )

auth_service = AuthService()

