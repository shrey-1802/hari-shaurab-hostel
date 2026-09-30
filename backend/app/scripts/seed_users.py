"""
Seed script to create initial admin and 4 wing leader users.
Allocations:
- Floor 4:
    - Wing Leader 1: Floor 4, Rooms 401–409
    - Wing Leader 2: Floor 4, Rooms 410–418
- Floor 6:
    - Wing Leader 3: Floor 6, Rooms 601–609
    - Wing Leader 4: Floor 6, Rooms 610–618

Usage:
    python -m app.scripts.seed_users
"""
import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.core.enums import UserRole


async def seed():
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        # Check if users already exist
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("⚠️  Users already exist, skipping seed.")
            return

        users = [
            # Main Leaders (Full hostel access)
            User(
                full_name="Main Leader",
                email="admin@hostel.com",
                hashed_password=hash_password("Admin@1234"),
                role=UserRole.MAIN_LEADER,
                floor_number=None,
                room_start=None,
                room_end=None,
            ),
            # Floor 4 Leaders
            User(
                full_name="Wing Leader (Floor 4: 401-409)",
                email="wingleader4a@hostel.com",
                hashed_password=hash_password("Wing@1234"),
                role=UserRole.WING_LEADER,
                floor_number=4,
                room_start="401",
                room_end="409",
            ),
            User(
                full_name="Wing Leader (Floor 4: 410-418)",
                email="wingleader4b@hostel.com",
                hashed_password=hash_password("Wing@1234"),
                role=UserRole.WING_LEADER,
                floor_number=4,
                room_start="410",
                room_end="418",
            ),
            # Floor 6 Leaders
            User(
                full_name="Wing Leader (Floor 6: 601-609)",
                email="wingleader6a@hostel.com",
                hashed_password=hash_password("Wing@1234"),
                role=UserRole.WING_LEADER,
                floor_number=6,
                room_start="601",
                room_end="609",
            ),
            User(
                full_name="Wing Leader (Floor 6: 610-618)",
                email="wingleader6b@hostel.com",
                hashed_password=hash_password("Wing@1234"),
                role=UserRole.WING_LEADER,
                floor_number=6,
                room_start="610",
                room_end="618",
            ),
        ]

        db.add_all(users)
        await db.commit()
        print("✅ Seed users created successfully!")
        for u in users:
            rooms_str = f"Rooms {u.room_start}-{u.room_end}" if u.room_start else "All Rooms"
            print(f"   📧 {u.email} ({u.role.value}) — Floor: {u.floor_number or 'All'}, {rooms_str}")


if __name__ == "__main__":
    asyncio.run(seed())
