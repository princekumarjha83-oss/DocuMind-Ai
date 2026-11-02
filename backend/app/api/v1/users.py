from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import GenericResponse
from app.schemas.user import (
    UserPreferenceResponse,
    UserPreferenceUpdateRequest,
    UserProfileResponse,
    UserUpdateRequest,
)
from app.services.user_service import user_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
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

@router.patch("/me", response_model=UserProfileResponse)
async def update_my_profile(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    updated = await user_service.update_profile(db, current_user, payload)
    return UserProfileResponse(
        id=updated.id,
        name=updated.full_name,
        email=updated.email,
        plan=updated.plan,
        role=updated.role,
        is_email_verified=updated.is_email_verified,
        is_active=updated.is_active,
        created_at=updated.created_at
    )

@router.get("/me/preferences", response_model=UserPreferenceResponse)
async def get_my_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    pref = await user_service.get_preferences(db, current_user.id)
    return UserPreferenceResponse.model_validate(pref)

@router.patch("/me/preferences", response_model=UserPreferenceResponse)
async def update_my_preferences(
    payload: UserPreferenceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    pref = await user_service.update_preferences(db, current_user.id, payload)
    return UserPreferenceResponse.model_validate(pref)

@router.delete("/me", response_model=GenericResponse)
async def delete_my_account(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Permanently delete user account and all owned documents, sessions, and data."""
    await user_service.delete_user(db, current_user)
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME)
    return GenericResponse(
        success=True,
        message="Your account and all associated documents have been permanently deleted."
    )

