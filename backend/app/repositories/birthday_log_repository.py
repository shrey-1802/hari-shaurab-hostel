from uuid import UUID
from typing import Optional, List
from datetime import date
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.birthday_log import BirthdayLog


class BirthdayLogRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def exists(
        self, student_id: UUID, notification_date: date, notification_type: str
    ) -> bool:
        """Check if a birthday notification has already been logged for today."""
        result = await self.db.execute(
            select(BirthdayLog).where(
                and_(
                    BirthdayLog.student_id == student_id,
                    BirthdayLog.notification_date == notification_date,
                    BirthdayLog.notification_type == notification_type,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    async def create(self, log: BirthdayLog) -> BirthdayLog:
        self.db.add(log)
        await self.db.flush()
        return log
