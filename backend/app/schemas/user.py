from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.core.enums import UserRole


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole
    floor_number: Optional[int] = None
    room_start: Optional[str] = None
    room_end: Optional[str] = None

    @field_validator("floor_number")
    @classmethod
    def validate_floor(cls, v, info):
        role = info.data.get("role")
        if role == UserRole.WING_LEADER and v is None:
            raise ValueError("Wing Leader must have a floor_number assigned")
        if role == UserRole.MAIN_LEADER and v is not None:
            raise ValueError("Main Leader should not have a floor_number")
        return v


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    floor_number: Optional[int] = None
    room_start: Optional[str] = None
    room_end: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserInDB(UserResponse):
    hashed_password: str
