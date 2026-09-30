from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.dashboard_service import DashboardService
from app.middleware.auth import get_current_user, require_main_leader, CurrentUser
from app.core.enums import UserRole
from app.core.exceptions import AuthorizationError

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/main-leader")
async def main_leader_dashboard(
    current_user: CurrentUser = Depends(require_main_leader),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard data for a Main Leader."""
    service = DashboardService(db)
    return await service.get_main_leader_dashboard(current_user.id)


@router.get("/wing-leader")
async def wing_leader_dashboard(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard data for a Wing Leader (scoped to their floor and assigned rooms)."""
    if current_user.role == UserRole.MAIN_LEADER:
        service = DashboardService(db)
        return await service.get_main_leader_dashboard(current_user.id)

    if current_user.floor_number is None:
        raise AuthorizationError("Wing Leader has no assigned floor")

    service = DashboardService(db)
    return await service.get_wing_leader_dashboard(
        user_id=current_user.id,
        floor_number=current_user.floor_number,
        room_start=current_user.room_start,
        room_end=current_user.room_end,
    )
