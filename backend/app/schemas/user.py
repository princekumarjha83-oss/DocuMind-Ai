from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    plan: str = "free"
    role: str = "member"
    is_email_verified: bool
    is_active: bool
    created_at: datetime
    avatar: Optional[str] = None

class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=128)

class UserPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    theme: str
    language: str
    email_notifications: bool
    zero_retention_acknowledged: bool

class UserPreferenceUpdateRequest(BaseModel):
    theme: Optional[str] = Field(None, pattern="^(dark|light|system)$")
    language: Optional[str] = Field(None, max_length=8)
    email_notifications: Optional[bool] = None
    zero_retention_acknowledged: Optional[bool] = None
