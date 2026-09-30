import json
from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from pywebpush import webpush, WebPushException
from loguru import logger
from app.core.config import settings
from app.models.browser_subscription import BrowserSubscription
from app.repositories.browser_subscription_repository import BrowserSubscriptionRepository


class PushNotificationService:
    """Sends Web Push notifications via VAPID protocol."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.sub_repo = BrowserSubscriptionRepository(db)

    async def subscribe(
        self, user_id: UUID, endpoint: str, p256dh: str, auth: str, user_agent: Optional[str] = None
    ) -> BrowserSubscription:
        """Register or update a push subscription for a user."""
        existing = await self.sub_repo.get_by_endpoint(endpoint)
        if existing:
            # Already subscribed, return existing
            return existing

        subscription = BrowserSubscription(
            user_id=user_id,
            endpoint=endpoint,
            p256dh=p256dh,
            auth=auth,
            user_agent=user_agent,
        )
        return await self.sub_repo.create(subscription)

    async def unsubscribe(self, endpoint: str) -> bool:
        return await self.sub_repo.delete_by_endpoint(endpoint)

    async def send_to_user(self, user_id: UUID, title: str, body: str, data: Optional[dict] = None):
        """Send push notification to all subscriptions of a user."""
        subscriptions = await self.sub_repo.get_for_user(user_id)
        for sub in subscriptions:
            await self._send_push(sub, title, body, data)

    async def send_to_users(self, user_ids: List[UUID], title: str, body: str, data: Optional[dict] = None):
        """Send push notification to all subscriptions of multiple users."""
        subscriptions = await self.sub_repo.get_for_users(user_ids)
        for sub in subscriptions:
            await self._send_push(sub, title, body, data)

    async def _send_push(
        self, subscription: BrowserSubscription, title: str, body: str, data: Optional[dict] = None
    ):
        """Send a single push notification."""
        if not settings.VAPID_PRIVATE_KEY or not settings.VAPID_PUBLIC_KEY:
            logger.warning("VAPID keys not configured, skipping push notification")
            return

        subscription_info = {
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh,
                "auth": subscription.auth,
            },
        }

        payload = json.dumps({
            "title": title,
            "body": body,
            "data": data or {},
        })

        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": settings.VAPID_SUBJECT},
            )
            logger.info(f"Push notification sent to {subscription.endpoint[:40]}...")
        except WebPushException as e:
            logger.error(f"Push notification failed: {e}")
            # If subscription expired/invalid, remove it
            if e.response and e.response.status_code in (404, 410):
                logger.info(f"Removing expired subscription: {subscription.endpoint[:40]}...")
                await self.sub_repo.delete_by_endpoint(subscription.endpoint)
        except Exception as e:
            logger.error(f"Unexpected push error: {e}")
