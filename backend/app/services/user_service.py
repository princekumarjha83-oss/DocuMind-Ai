from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.preference import UserPreference
from app.schemas.user import UserProfileResponse, UserPreferenceResponse, UserPreferenceUpdateRequest, UserUpdateRequest

class UserService:
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        normalized_email = email.strip().lower()
        result = await db.execute(select(User).where(User.email == normalized_email))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_profile(db: AsyncSession, user: User, update_data: UserUpdateRequest) -> User:
        if update_data.name is not None:
            user.full_name = update_data.name.strip()
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_preferences(db: AsyncSession, user_id: str) -> UserPreference:
        result = await db.execute(select(UserPreference).where(UserPreference.user_id == user_id))
        pref = result.scalar_one_or_none()
        if not pref:
            pref = UserPreference(user_id=user_id)
            db.add(pref)
            await db.commit()
            await db.refresh(pref)
        return pref

    @staticmethod
    async def update_preferences(db: AsyncSession, user_id: str, update_data: UserPreferenceUpdateRequest) -> UserPreference:
        pref = await UserService.get_preferences(db, user_id)
        if update_data.theme is not None:
            pref.theme = update_data.theme
        if update_data.language is not None:
            pref.language = update_data.language
        if update_data.email_notifications is not None:
            pref.email_notifications = update_data.email_notifications
        if update_data.zero_retention_acknowledged is not None:
            pref.zero_retention_acknowledged = update_data.zero_retention_acknowledged
        await db.commit()
        await db.refresh(pref)
        return pref

    @staticmethod
    async def delete_user(db: AsyncSession, user: User) -> None:
        """Permanently erase user and cascade deletion of all user documents, sessions, and data."""
        await db.delete(user)
        await db.commit()

user_service = UserService()

