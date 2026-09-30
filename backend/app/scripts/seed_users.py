"""
Seed script to create initial admin and 4 wing leader users with real emails and names.
Allocations:
- Main Leader:
    - PriyankBhai (priyankshah3690@gmail.com)
- Floor 4:
    - AryanBhai: Floor 4, Rooms 401–409 (aryansinhc673@gmail.com)
    - ShreemadBhai: Floor 4, Rooms 410–418 (shreemadgandhi369@gmail.com)
- Floor 6:
    - JeetBhai: Floor 6, Rooms 601–609 (jeetsinhsolanki749@gmail.com)
    - ParamBhai: Floor 6, Rooms 610–618 (patelparam2111@gmail.com)

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
            # Main Leader (Full hostel access)
            User(
                full_name="PriyankBhai",
                email="priyankshah3690@gmail.com",
                hashed_password=hash_password("Priyank@0369"),
                role=UserRole.MAIN_LEADER,
                floor_number=None,
                room_start=None,
                room_end=None,
            ),
            # Floor 4 Leaders
            User(
                full_name="AryanBhai (Floor 4: 401-409)",
                email="aryansinhc673@gmail.com",
                hashed_password=hash_password("Aryan@0369"),
                role=UserRole.WING_LEADER,
                floor_number=4,
                room_start="401",
                room_end="409",
            ),
            User(
                full_name="ShreemadBhai (Floor 4: 410-418)",
                email="shreemadgandhi369@gmail.com",
                hashed_password=hash_password("Shreemad@0369"),
                role=UserRole.WING_LEADER,
                floor_number=4,
                room_start="410",
                room_end="418",
            ),
            # Floor 6 Leaders
            User(
                full_name="JeetBhai (Floor 6: 601-609)",
                email="jeetsinhsolanki749@gmail.com",
                hashed_password=hash_password("Jeet@0369"),
                role=UserRole.WING_LEADER,
                floor_number=6,
                room_start="601",
                room_end="609",
            ),
            User(
                full_name="ParamBhai (Floor 6: 610-618)",
                email="patelparam2111@gmail.com",
                hashed_password=hash_password("Param@0369"),
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
