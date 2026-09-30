from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import LoginRequest, RefreshTokenRequest, ForgotPasswordRequest, TokenResponse
from app.services.auth_service import AuthService
from app.middleware.auth import get_current_user, CurrentUser, get_client_ip, get_user_agent

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
async def login(
    body: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate a user and return JWT tokens."""
    service = AuthService(db)
    result = await service.login(
        email=body.email,
        password=body.password,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return result


@router.post("/logout")
async def logout(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log out the current user."""
    service = AuthService(db)
    result = await service.logout(
        user_id=current_user.id,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return result


@router.post("/refresh")
async def refresh_token(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh an access token using a valid refresh token."""
    service = AuthService(db)
    result = await service.refresh(body.refresh_token)
    return result


@router.post("/forgot-password")
async def forgot_password(
    body: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request a password reset link."""
    service = AuthService(db)
    result = await service.forgot_password(body.email)
    return result
