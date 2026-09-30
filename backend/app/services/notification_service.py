import json
from uuid import UUID
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.models.student import Student
from app.core.enums import NotificationType, UserRole
from app.repositories.notification_repository import NotificationRepository
from app.repositories.user_repository import UserRepository


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)
        self.user_repo = UserRepository(db)

    async def create_notification(
        self,
        recipient_id: UUID,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: Optional[dict] = None,
    ) -> Notification:
        """Create a single notification for a user."""
        notification = Notification(
            recipient_id=recipient_id,
            notification_type=notification_type,
            title=title,
            message=message,
            data=json.dumps(data) if data else None,
        )
        return await self.repo.create(notification)

    async def notify_birthday_tomorrow(self, student: Student) -> List[Notification]:
        """Send 'birthday tomorrow' notifications to relevant leaders."""
        leaders = await self.user_repo.get_leaders_for_floor(student.floor_number)

        notifications = []
        for leader in leaders:
            notification = Notification(
                recipient_id=leader.id,
                notification_type=NotificationType.BIRTHDAY_TOMORROW,
                title="🎂 Birthday Reminder",
                message=f"{student.full_name}'s birthday is tomorrow. Room {student.room_number}, Floor {student.floor_number}.",
                data=json.dumps({
                    "student_id": str(student.id),
                    "student_name": student.full_name,
                    "student_mobile": student.student_mobile,
                    "room_number": student.room_number,
                    "floor_number": student.floor_number,
                }),
            )
            notifications.append(notification)

        if notifications:
            await self.repo.create_many(notifications)
        return notifications

    async def notify_birthday_today(self, student: Student) -> List[Notification]:
        """Send 'birthday today' notifications to relevant leaders."""
        leaders = await self.user_repo.get_leaders_for_floor(student.floor_number)

        notifications = []
        for leader in leaders:
            notification = Notification(
                recipient_id=leader.id,
                notification_type=NotificationType.BIRTHDAY_TODAY,
                title="🎂 Birthday Today!",
                message=f"Today is {student.full_name}'s birthday! Room {student.room_number}, Floor {student.floor_number}.",
                data=json.dumps({
                    "student_id": str(student.id),
                    "student_name": student.full_name,
                    "student_mobile": student.student_mobile,
                    "room_number": student.room_number,
                    "floor_number": student.floor_number,
                }),
            )
            notifications.append(notification)

        if notifications:
            await self.repo.create_many(notifications)
        return notifications

    async def notify_new_student(self, student: Student, created_by: UUID) -> List[Notification]:
        """Send notifications when a new student is added."""
        leaders = await self.user_repo.get_leaders_for_floor(student.floor_number)

        notifications = []
        for leader in leaders:
            # Don't notify the creator
            if leader.id == created_by:
                continue
            notification = Notification(
                recipient_id=leader.id,
                notification_type=NotificationType.NEW_STUDENT,
                title="👤 New Student Added",
                message=f"{student.full_name} has been added to Room {student.room_number}, Floor {student.floor_number}.",
                data=json.dumps({
                    "student_id": str(student.id),
                    "student_name": student.full_name,
                }),
            )
            notifications.append(notification)

        if notifications:
            await self.repo.create_many(notifications)
        return notifications

    async def get_notifications(self, user_id: UUID, limit: int = 50, offset: int = 0) -> dict:
        """Get notifications for a user with unread count."""
        notifications = await self.repo.get_for_user(user_id, limit=limit, offset=offset)
        total = await self.repo.count_for_user(user_id)
        unread_count = await self.repo.count_unread(user_id)

        return {
            "notifications": notifications,
            "total": total,
            "unread_count": unread_count,
        }

    async def mark_read(self, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        return await self.repo.mark_read(notification_id, user_id)

    async def mark_all_read(self, user_id: UUID) -> int:
        return await self.repo.mark_all_read(user_id)

    async def delete_notification(self, notification_id: UUID, user_id: UUID) -> bool:
        return await self.repo.delete(notification_id, user_id)

    async def get_unread_count(self, user_id: UUID) -> int:
        return await self.repo.count_unread(user_id)
