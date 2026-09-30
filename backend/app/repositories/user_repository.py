from uuid import UUID
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update(self, user: User) -> User:
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_all_leaders(self) -> list[User]:
        """Get all active leaders (both Main and Wing)."""
        result = await self.db.execute(
            select(User).where(User.is_active == True)
        )
        return list(result.scalars().all())

    async def get_leaders_for_floor(self, floor_number: int) -> list[User]:
        """Get Main Leaders + Wing Leaders assigned to a specific floor."""
        from app.core.enums import UserRole
        result = await self.db.execute(
            select(User).where(
                User.is_active == True,
                (User.role == UserRole.MAIN_LEADER) |
                ((User.role == UserRole.WING_LEADER) & (User.floor_number == floor_number))
            )
        )
        return list(result.scalars().all())
