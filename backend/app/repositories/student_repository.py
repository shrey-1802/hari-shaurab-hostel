from uuid import UUID
from typing import Optional, Tuple, List
from datetime import date, timedelta
from sqlalchemy import select, func, or_, extract, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.student import Student


class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, student_id: UUID) -> Optional[Student]:
        result = await self.db.execute(select(Student).where(Student.id == student_id))
        return result.scalar_one_or_none()

    async def get_by_student_number(self, student_number: str) -> Optional[Student]:
        result = await self.db.execute(
            select(Student).where(Student.student_number == student_number)
        )
        return result.scalar_one_or_none()

    async def create(self, student: Student) -> Student:
        self.db.add(student)
        await self.db.flush()
        await self.db.refresh(student)
        return student

    async def update(self, student: Student) -> Student:
        await self.db.flush()
        await self.db.refresh(student)
        return student

    async def delete(self, student: Student) -> None:
        await self.db.delete(student)
        await self.db.flush()

    def _apply_scope_filters(
        self,
        query,
        count_query=None,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ):
        """Helper to apply floor and room range restrictions for wing leaders."""
        if floor_restriction is not None:
            query = query.where(Student.floor_number == floor_restriction)
            if count_query is not None:
                count_query = count_query.where(Student.floor_number == floor_restriction)

        if room_start and room_end:
            query = query.where(Student.room_number >= room_start, Student.room_number <= room_end)
            if count_query is not None:
                count_query = count_query.where(Student.room_number >= room_start, Student.room_number <= room_end)

        if count_query is not None:
            return query, count_query
        return query

    async def search(
        self,
        search: Optional[str] = None,
        floor: Optional[int] = None,
        department: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> Tuple[List[Student], int]:
        """
        Search students with filtering, pagination, and floor/room restriction.
        """
        query = select(Student)
        count_query = select(func.count()).select_from(Student)

        # Enforce floor and room scope
        query, count_query = self._apply_scope_filters(
            query, count_query, floor_restriction, room_start, room_end
        )

        # Filter by specific floor (user-selected filter)
        if floor is not None:
            query = query.where(Student.floor_number == floor)
            count_query = count_query.where(Student.floor_number == floor)

        # Filter by department
        if department:
            query = query.where(Student.department.ilike(f"%{department}%"))
            count_query = count_query.where(Student.department.ilike(f"%{department}%"))

        # Search across name, room, student number
        if search:
            search_filter = or_(
                Student.full_name.ilike(f"%{search}%"),
                Student.room_number.ilike(f"%{search}%"),
                Student.student_number.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # Get total count
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginate
        offset = (page - 1) * page_size
        query = query.order_by(Student.room_number, Student.full_name).offset(offset).limit(page_size)

        result = await self.db.execute(query)
        students = list(result.scalars().all())

        return students, total

    async def get_birthdays_today(
        self,
        today: date,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> List[Student]:
        """Get students whose birthday is today within leader's scope."""
        query = select(Student).where(
            extract("month", Student.date_of_birth) == today.month,
            extract("day", Student.date_of_birth) == today.day,
        )
        query = self._apply_scope_filters(query, None, floor_restriction, room_start, room_end)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_birthdays_tomorrow(
        self,
        today: date,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> List[Student]:
        """Get students whose birthday is tomorrow within leader's scope."""
        tomorrow = today + timedelta(days=1)
        query = select(Student).where(
            extract("month", Student.date_of_birth) == tomorrow.month,
            extract("day", Student.date_of_birth) == tomorrow.day,
        )
        query = self._apply_scope_filters(query, None, floor_restriction, room_start, room_end)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_upcoming_birthdays(
        self,
        today: date,
        days: int = 30,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> List[Student]:
        """Get students with birthdays in the next N days within leader's scope."""
        students_query = select(Student)
        students_query = self._apply_scope_filters(students_query, None, floor_restriction, room_start, room_end)

        result = await self.db.execute(students_query)
        all_students = list(result.scalars().all())

        upcoming = []
        for student in all_students:
            dob = student.date_of_birth
            try:
                birthday_this_year = dob.replace(year=today.year)
            except ValueError:
                birthday_this_year = dob.replace(year=today.year, day=28)

            if birthday_this_year < today:
                try:
                    birthday_this_year = dob.replace(year=today.year + 1)
                except ValueError:
                    birthday_this_year = dob.replace(year=today.year + 1, day=28)

            days_until = (birthday_this_year - today).days
            if 0 <= days_until <= days:
                upcoming.append((student, days_until))

        upcoming.sort(key=lambda x: x[1])
        return upcoming

    async def count_by_floor(
        self,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> dict:
        """Count students grouped by floor within leader's scope."""
        query = select(Student.floor_number, func.count()).group_by(Student.floor_number)
        query = self._apply_scope_filters(query, None, floor_restriction, room_start, room_end)
        result = await self.db.execute(query)
        return {row[0]: row[1] for row in result.all()}

    async def count_total(
        self,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> int:
        query = select(func.count()).select_from(Student)
        query = self._apply_scope_filters(query, None, floor_restriction, room_start, room_end)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_recent(
        self,
        limit: int = 5,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> List[Student]:
        query = select(Student).order_by(Student.created_at.desc()).limit(limit)
        query = self._apply_scope_filters(query, None, floor_restriction, room_start, room_end)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_birthdays_this_month(
        self,
        today: date,
        floor_restriction: Optional[int] = None,
        room_start: Optional[str] = None,
        room_end: Optional[str] = None,
    ) -> int:
        query = select(func.count()).select_from(Student).where(
            extract("month", Student.date_of_birth) == today.month
        )
        query = self._apply_scope_filters(query, None, floor_restriction, room_start, room_end)
        result = await self.db.execute(query)
        return result.scalar() or 0
