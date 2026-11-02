from typing import Optional
from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limit import rate_limit_dependency
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    GenericResponse,
    ResetPasswordRequest,
    ResendVerificationRequest,
    UserLoginRequest,
    UserRegisterRequest,
    VerifyEmailRequest,
)
from app.schemas.user import UserProfileResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit_dependency(max_requests=10, window_seconds=60))]
)
async def register(
    register_data: UserRegisterRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user account with Argon2id password hashing."""
    user, raw_verification_token = await auth_service.register(db, register_data)

    # Immediately log in the newly registered user (or require verification per policy)
    login_data = UserLoginRequest(
        email=register_data.email,
        password=register_data.password,
        remember_me=False
    )
    auth_resp, session_token = await auth_service.login(
        db=db,
        login_data=login_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    # Set secure HttpOnly session cookie
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session_token,
        httponly=True,
        secure=settings.SECURE_COOKIE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=7 * 24 * 3600
    )

    return auth_resp

@router.post(
    "/login",
    response_model=AuthResponse,
    dependencies=[Depends(rate_limit_dependency(max_requests=15, window_seconds=60))]
)
async def login(
    login_data: UserLoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Sign in with email and password, establishing real session."""
    auth_resp, session_token = await auth_service.login(
        db=db,
        login_data=login_data,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )

    # Set secure HttpOnly cookie
    max_age_days = settings.REFRESH_TOKEN_EXPIRE_DAYS if login_data.remember_me else 7
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session_token,
        httponly=True,
        secure=settings.SECURE_COOKIE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=max_age_days * 24 * 3600
    )

    return auth_resp

@router.post("/logout", response_model=GenericResponse)
async def logout(
    response: Response,
    documind_session: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """Invalidate server session and delete authentication cookie."""
    if documind_session:
        await auth_service.logout(db, documind_session)

    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        httponly=True,
        secure=settings.SECURE_COOKIE,
        samesite=settings.COOKIE_SAMESITE
    )

    return GenericResponse(success=True, message="Successfully signed out.")

@router.post("/logout-all", response_model=GenericResponse)
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Invalidate all active sessions across all devices for the current user."""
    await auth_service.logout_all(db, current_user.id)
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME)
    return GenericResponse(success=True, message="Successfully signed out of all devices.")

@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Get authenticated user profile."""
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.full_name,
        email=current_user.email,
        plan=current_user.plan,
        role=current_user.role,
        is_email_verified=current_user.is_email_verified,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@router.post("/verify-email", response_model=GenericResponse)
async def verify_email(
    payload: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify email address with cryptographic single-use token."""
    return await auth_service.verify_email(db, payload.token)

@router.post(
    "/resend-verification",
    response_model=GenericResponse,
    dependencies=[Depends(rate_limit_dependency(max_requests=5, window_seconds=60))]
)
async def resend_verification(
    payload: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request a new email verification token."""
    return await auth_service.resend_verification(db, payload.email)

@router.post(
    "/forgot-password",
    response_model=GenericResponse,
    dependencies=[Depends(rate_limit_dependency(max_requests=5, window_seconds=60))]
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request password reset link. Returns generic response without revealing account existence."""
    return await auth_service.request_password_reset(db, payload.email)

@router.post(
    "/reset-password",
    response_model=GenericResponse,
    dependencies=[Depends(rate_limit_dependency(max_requests=10, window_seconds=60))]
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set new password using single-use reset token."""
    return await auth_service.reset_password(db, payload)

@router.post("/change-password", response_model=GenericResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change password after verifying the user's current password."""
    return await auth_service.change_password(db, current_user, payload)

