from uuid import UUID
from typing import Optional, List
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.browser_subscription import BrowserSubscription


class BrowserSubscriptionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, subscription: BrowserSubscription) -> BrowserSubscription:
        self.db.add(subscription)
        await self.db.flush()
        await self.db.refresh(subscription)
        return subscription

    async def get_by_endpoint(self, endpoint: str) -> Optional[BrowserSubscription]:
        result = await self.db.execute(
            select(BrowserSubscription).where(BrowserSubscription.endpoint == endpoint)
        )
        return result.scalar_one_or_none()

    async def get_for_user(self, user_id: UUID) -> List[BrowserSubscription]:
        result = await self.db.execute(
            select(BrowserSubscription).where(BrowserSubscription.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_for_users(self, user_ids: List[UUID]) -> List[BrowserSubscription]:
        result = await self.db.execute(
            select(BrowserSubscription).where(
                BrowserSubscription.user_id.in_(user_ids)
            )
        )
        return list(result.scalars().all())

    async def delete_by_endpoint(self, endpoint: str) -> bool:
        result = await self.db.execute(
            delete(BrowserSubscription).where(BrowserSubscription.endpoint == endpoint)
        )
        await self.db.flush()
        return result.rowcount > 0

    async def delete_by_id(self, subscription_id: UUID, user_id: UUID) -> bool:
        result = await self.db.execute(
            delete(BrowserSubscription).where(
                BrowserSubscription.id == subscription_id,
                BrowserSubscription.user_id == user_id,
            )
        )
        await self.db.flush()
        return result.rowcount > 0
