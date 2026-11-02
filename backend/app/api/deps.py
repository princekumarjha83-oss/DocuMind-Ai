from typing import Optional
from fastapi import Cookie, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import decode_access_token, hash_token
from app.db.session import get_db
from app.models.session import UserSession
from app.models.user import User

async def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    documind_session: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Extract authenticated user from Authorization Bearer header OR HttpOnly session cookie."""
    user_id: Optional[str] = None

    # 1. Try Bearer token in Authorization header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            user_id = payload["sub"]

    # 2. Try session cookie if Bearer token not provided or invalid
    if not user_id and documind_session:
        session_token_hash = hash_token(documind_session)
        result = await db.execute(
            select(UserSession)
            .where(
                UserSession.session_token_hash == session_token_hash,
                UserSession.is_revoked == False
            )
        )
        session_record = result.scalar_one_or_none()
        if session_record:
            user_id = session_record.user_id

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 3. Retrieve user from database to verify active state
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this session no longer exists.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated. Please contact support."
        )

    return user

async def get_current_active_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if settings.REQUIRE_EMAIL_VERIFICATION and not current_user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required to access this resource."
        )
    return current_user

