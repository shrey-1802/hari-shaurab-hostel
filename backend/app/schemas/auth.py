from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class TokenPayload(BaseModel):
    sub: str  # user_id
    role: str
    floor: Optional[int] = None
    room_start: Optional[str] = None
    room_end: Optional[str] = None
    type: str
