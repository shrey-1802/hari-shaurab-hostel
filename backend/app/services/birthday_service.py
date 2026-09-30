from datetime import date
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.student_repository import StudentRepository


class BirthdayService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.student_repo = StudentRepository(db)

    async def get_today(self, user_role: str, user_floor: Optional[int] = None) -> list:
        """Get students whose birthday is today."""
        from app.core.enums import UserRole
        floor_restriction = user_floor if (user_role == UserRole.WING_LEADER.value or user_role == UserRole.WING_LEADER) else None
        today = date.today()
        students = await self.student_repo.get_birthdays_today(today, floor_restriction)
        return [self._to_response(s, 0) for s in students]

    async def get_tomorrow(self, user_role: str, user_floor: Optional[int] = None) -> list:
        """Get students whose birthday is tomorrow."""
        from app.core.enums import UserRole
        floor_restriction = user_floor if (user_role == UserRole.WING_LEADER.value or user_role == UserRole.WING_LEADER) else None
        today = date.today()
        students = await self.student_repo.get_birthdays_tomorrow(today, floor_restriction)
        return [self._to_response(s, 1) for s in students]

    async def get_upcoming(
        self, days: int = 30, user_role: str = "MAIN_LEADER", user_floor: Optional[int] = None
    ) -> list:
        """Get students with birthdays in the next N days."""
        from app.core.enums import UserRole
        floor_restriction = user_floor if (user_role == UserRole.WING_LEADER.value or user_role == UserRole.WING_LEADER) else None
        today = date.today()
        upcoming = await self.student_repo.get_upcoming_birthdays(today, days, floor_restriction)
        return [self._to_response(student, days_until) for student, days_until in upcoming]

    @staticmethod
    def _to_response(student, days_until: int) -> dict:
        return {
            "id": str(student.id),
            "full_name": student.full_name,
            "date_of_birth": student.date_of_birth.isoformat(),
            "floor_number": student.floor_number,
            "room_number": student.room_number,
            "student_mobile": student.student_mobile,
            "profile_picture_url": student.profile_picture_url,
            "days_until_birthday": days_until,
        }
