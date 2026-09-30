from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.birthday_service import BirthdayService
from app.middleware.auth import get_current_user, CurrentUser

router = APIRouter(prefix="/birthdays", tags=["Birthdays"])


@router.get("/today")
async def get_birthdays_today(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get students whose birthday is today."""
    service = BirthdayService(db)
    result = await service.get_today(
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
    )
    return {"birthdays": result, "count": len(result)}


@router.get("/tomorrow")
async def get_birthdays_tomorrow(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get students whose birthday is tomorrow."""
    service = BirthdayService(db)
    result = await service.get_tomorrow(
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
    )
    return {"birthdays": result, "count": len(result)}


@router.get("/upcoming")
async def get_upcoming_birthdays(
    days: int = Query(30, ge=1, le=365, description="Number of days to look ahead"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get students with birthdays in the next N days."""
    service = BirthdayService(db)
    result = await service.get_upcoming(
        days=days,
        user_role=current_user.role.value,
        user_floor=current_user.floor_number,
    )
    return {"birthdays": result, "count": len(result)}
