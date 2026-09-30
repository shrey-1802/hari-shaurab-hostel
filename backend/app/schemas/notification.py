from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from app.core.enums import NotificationType


class NotificationResponse(BaseModel):
    id: UUID
    recipient_id: UUID
    notification_type: NotificationType
    title: str
    message: str
    data: Optional[str] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    unread_count: int


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh: str
    auth: str


class PushSubscriptionResponse(BaseModel):
    id: UUID
    endpoint: str
    created_at: datetime

    model_config = {"from_attributes": True}
