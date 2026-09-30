from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID


class FloorStats(BaseModel):
    floor_number: int
    student_count: int


class MainLeaderDashboard(BaseModel):
    total_students: int
    students_by_floor: List[FloorStats]
    upcoming_birthdays: List[Dict[str, Any]]
    recent_students: List[Dict[str, Any]]
    unread_notifications: int
    birthdays_this_month: int
    birthdays_today: int


class WingLeaderDashboard(BaseModel):
    assigned_floor: int
    total_students: int
    upcoming_birthdays: List[Dict[str, Any]]
    recent_students: List[Dict[str, Any]]
    unread_notifications: int
    birthdays_today: int
