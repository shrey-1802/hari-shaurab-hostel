from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.core.config import settings
from app.core.enums import UserRole, AuditAction
from app.core.exceptions import AuthenticationError, NotFoundError
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)

    async def login(
        self, email: str, password: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> dict:
        """Authenticate user and return tokens with floor & room permissions."""
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        if not user.is_active:
            raise AuthenticationError("Account is deactivated")

        access_token = create_access_token(
            subject=str(user.id),
            role=user.role.value,
            floor_number=user.floor_number,
            room_start=user.room_start,
            room_end=user.room_end,
        )
        refresh_token = create_refresh_token(subject=str(user.id))

        # Log the login event
        await self.audit_service.log(
            user_id=user.id,
            action=AuditAction.LOGIN,
            description=f"User {user.email} logged in",
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "floor_number": user.floor_number,
                "room_start": user.room_start,
                "room_end": user.room_end,
            },
        }

    async def refresh(self, refresh_token_str: str) -> dict:
        """Refresh the access token using a valid refresh token."""
        user_id = decode_refresh_token(refresh_token_str)
        user = await self.user_repo.get_by_id(UUID(user_id))
        if not user or not user.is_active:
            raise AuthenticationError("Invalid refresh token")

        access_token = create_access_token(
            subject=str(user.id),
            role=user.role.value,
            floor_number=user.floor_number,
            room_start=user.room_start,
            room_end=user.room_end,
        )
        new_refresh_token = create_refresh_token(subject=str(user.id))

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    async def logout(
        self, user_id: UUID, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> dict:
        """Log the logout event. Token invalidation is handled client-side."""
        await self.audit_service.log(
            user_id=user_id,
            action=AuditAction.LOGOUT,
            description="User logged out",
            ip_address=ip_address,
            user_agent=user_agent,
        )
        return {"message": "Logged out successfully"}

    async def forgot_password(self, email: str) -> dict:
        """Handle forgot password request."""
        user = await self.user_repo.get_by_email(email)
        if not user:
            return {"message": "If an account exists with this email, a reset link has been sent"}

        from datetime import timedelta
        reset_token = create_access_token(
            subject=str(user.id),
            role="reset",
            expires_delta=timedelta(minutes=15),
        )

        await self.audit_service.log(
            user_id=user.id,
            action=AuditAction.PASSWORD_RESET_REQUEST,
            description="Password reset requested",
        )

        return {
            "message": "If an account exists with this email, a reset link has been sent",
            "reset_token": reset_token,
        }
