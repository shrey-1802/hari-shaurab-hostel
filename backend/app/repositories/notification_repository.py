from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from app.models.notification import Notification
from app.core.enums import NotificationType


class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, notification: Notification) -> Notification:
        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)
        return notification

    async def create_many(self, notifications: List[Notification]) -> List[Notification]:
        self.db.add_all(notifications)
        await self.db.flush()
        for n in notifications:
            await self.db.refresh(n)
        return notifications

    async def get_by_id(self, notification_id: UUID) -> Optional[Notification]:
        result = await self.db.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return result.scalar_one_or_none()

    async def get_for_user(
        self, user_id: UUID, limit: int = 50, offset: int = 0
    ) -> List[Notification]:
        result = await self.db.execute(
            select(Notification)
            .where(Notification.recipient_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def count_for_user(self, user_id: UUID) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Notification)
            .where(Notification.recipient_id == user_id)
        )
        return result.scalar()

    async def count_unread(self, user_id: UUID) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Notification)
            .where(
                Notification.recipient_id == user_id,
                Notification.is_read == False,
            )
        )
        return result.scalar()

    async def mark_read(self, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        notification = await self.get_by_id(notification_id)
        if notification and notification.recipient_id == user_id:
            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            await self.db.flush()
            await self.db.refresh(notification)
            return notification
        return None

    async def mark_all_read(self, user_id: UUID) -> int:
        result = await self.db.execute(
            update(Notification)
            .where(
                Notification.recipient_id == user_id,
                Notification.is_read == False,
            )
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        await self.db.flush()
        return result.rowcount

    async def delete(self, notification_id: UUID, user_id: UUID) -> bool:
        notification = await self.get_by_id(notification_id)
        if notification and notification.recipient_id == user_id:
            await self.db.delete(notification)
            await self.db.flush()
            return True
        return False
