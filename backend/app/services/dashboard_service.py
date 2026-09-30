from datetime import date
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.student_repository import StudentRepository
from app.repositories.notification_repository import NotificationRepository
from app.core.enums import UserRole
from uuid import UUID


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.student_repo = StudentRepository(db)
        self.notification_repo = NotificationRepository(db)

    async def get_main_leader_dashboard(self, user_id: UUID) -> dict:
        """Build the Main Leader dashboard data (unrestricted)."""
        today = date.today()
        total = await self.student_repo.count_total()
        floor_counts = await self.student_repo.count_by_floor()
        upcoming = await self.student_repo.get_upcoming_birthdays(today, days=7)
        recent = await self.student_repo.get_recent(limit=5)
        unread = await self.notification_repo.count_unread(user_id)
        birthdays_month = await self.student_repo.count_birthdays_this_month(today)
        birthdays_today = await self.student_repo.get_birthdays_today(today)

        return {
            "total_students": total,
            "students_by_floor": [
                {"floor_number": floor, "student_count": count}
                for floor, count in sorted(floor_counts.items())
            ],
            "upcoming_birthdays": [
                {
                    "id": str(s.id),
                    "full_name": s.full_name,
                    "date_of_birth": s.date_of_birth.isoformat(),
                    "floor_number": s.floor_number,
                    "room_number": s.room_number,
                    "profile_picture_url": s.profile_picture_url,
                    "days_until_birthday": days,
                }
                for s, days in upcoming
            ],
            "recent_students": [
                {
                    "id": str(s.id),
                    "full_name": s.full_name,
                    "floor_number": s.floor_number,
                    "room_number": s.room_number,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in recent
            ],
            "unread_notifications": unread,
            "birthdays_this_month": birthdays_month,
            "birthdays_today": len(birthdays_today),
        }

    async def get_wing_leader_dashboard(
        self,
        user_id: UUID,
        floor_number: int,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> dict:
        """Build the Wing Leader dashboard data (restricted to floor & room range)."""
        today = date.today()
        total = await self.student_repo.count_total(
            floor_restriction=floor_number, room_start=room_start, room_end=room_end
        )
        upcoming = await self.student_repo.get_upcoming_birthdays(
            today, days=7, floor_restriction=floor_number, room_start=room_start, room_end=room_end
        )
        recent = await self.student_repo.get_recent(
            limit=5, floor_restriction=floor_number, room_start=room_start, room_end=room_end
        )
        unread = await self.notification_repo.count_unread(user_id)
        birthdays_today = await self.student_repo.get_birthdays_today(
            today, floor_restriction=floor_number, room_start=room_start, room_end=room_end
        )

        return {
            "assigned_floor": floor_number,
            "assigned_rooms": f"{room_start}–{room_end}" if room_start and room_end else "All Rooms",
            "room_start": room_start,
            "room_end": room_end,
            "total_students": total,
            "upcoming_birthdays": [
                {
                    "id": str(s.id),
                    "full_name": s.full_name,
                    "date_of_birth": s.date_of_birth.isoformat(),
                    "floor_number": s.floor_number,
                    "room_number": s.room_number,
                    "profile_picture_url": s.profile_picture_url,
                    "days_until_birthday": days,
                }
                for s, days in upcoming
            ],
            "recent_students": [
                {
                    "id": str(s.id),
                    "full_name": s.full_name,
                    "floor_number": s.floor_number,
                    "room_number": s.room_number,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in recent
            ],
            "unread_notifications": unread,
            "birthdays_today": len(birthdays_today),
        }
