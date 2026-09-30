from uuid import UUID
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import decode_token
from app.core.enums import UserRole
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.db.session import get_db
from app.repositories.user_repository import UserRepository

security_scheme = HTTPBearer()


class CurrentUser:
    """Holds the authenticated user's identity extracted from the JWT."""
    def __init__(
        self,
        user_id: UUID,
        role: UserRole,
        floor_number: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ):
        self.id = user_id
        self.role = role
        self.floor_number = floor_number
        self.room_start = room_start
        self.room_end = room_end

    @property
    def is_main_leader(self) -> bool:
        return self.role == UserRole.MAIN_LEADER

    @property
    def is_wing_leader(self) -> bool:
        return self.role == UserRole.WING_LEADER


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> CurrentUser:
    """FastAPI dependency: decode JWT and return the current user identity."""
    payload = decode_token(credentials.credentials)

    if payload.get("type") != "access":
        raise AuthenticationError("Invalid token type")

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
        raise AuthenticationError("Invalid token payload")

    try:
        role_enum = UserRole(role)
    except ValueError:
        raise AuthenticationError("Invalid role in token")

    return CurrentUser(
        user_id=UUID(user_id),
        role=role_enum,
        floor_number=payload.get("floor"),
        room_start=payload.get("room_start"),
        room_end=payload.get("room_end"),
    )


async def require_main_leader(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Dependency: require the user to be a Main Leader."""
    if not current_user.is_main_leader:
        raise AuthorizationError("Only Main Leaders can access this resource")
    return current_user


async def require_any_leader(
    current_user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    """Dependency: require the user to be any leader (Main or Wing)."""
    return current_user


def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP from request headers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return None


def get_user_agent(request: Request) -> Optional[str]:
    """Extract user agent from request headers."""
    return request.headers.get("user-agent")
