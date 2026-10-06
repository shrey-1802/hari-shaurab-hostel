from uuid import UUID
from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.registration_link import RegistrationLink
from app.models.student import Student


class RegistrationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_token(self, token: str) -> Optional[RegistrationLink]:
        """Fetch registration link by token."""
        result = await self.db.execute(
            select(RegistrationLink).where(
                RegistrationLink.registration_token == token,
                RegistrationLink.is_active == True,
            )
        )
        return result.scalar_one_or_none()

    async def get_all(self) -> List[RegistrationLink]:
        """Fetch all registration links."""
        result = await self.db.execute(select(RegistrationLink).order_by(RegistrationLink.assigned_floor, RegistrationLink.room_start))
        return list(result.scalars().all())

    async def get_by_leader_id(self, leader_id: UUID) -> Optional[RegistrationLink]:
        """Fetch link by Wing Leader ID."""
        result = await self.db.execute(
            select(RegistrationLink).where(RegistrationLink.wing_leader_id == leader_id)
        )
        return result.scalar_one_or_none()

    async def count_room_occupancy(self, floor_number: int, room_number: str) -> int:
        """
        Count non-rejected students (both APPROVED and PENDING) in room to enforce max 2 capacity rule.
        """
        query = select(func.count()).select_from(Student).where(
            Student.floor_number == floor_number,
            Student.room_number == room_number,
            Student.registration_status.in_(["APPROVED", "PENDING"]),
        )
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_pending_registrations(
        self,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> List[Student]:
        """
        Fetch pending student self-registrations based on leader access scope.
        """
        query = select(Student).where(Student.registration_status == "PENDING")

        if floor_restriction is not None:
            query = query.where(Student.floor_number == floor_restriction)

        if room_start and room_end:
            query = query.where(Student.room_number >= room_start, Student.room_number <= room_end)

        query = query.order_by(Student.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
