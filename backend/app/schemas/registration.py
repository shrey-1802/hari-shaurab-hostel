from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
import re


class RoomAvailabilityInfo(BaseModel):
    room_number: str
    occupied: int
    capacity: int = 2
    available_beds: int
    is_available: bool


class RegistrationLinkInfoResponse(BaseModel):
    registration_token: str
    assigned_floor: int
    room_start: str
    room_end: str
    wing_leader_name: str
    is_active: bool
    available_rooms: List[RoomAvailabilityInfo]


class StudentSelfRegistrationCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    date_of_birth: date
    student_number: str = Field(..., min_length=2, max_length=100)
    student_mobile: str = Field(..., min_length=10, max_length=20)
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    college_name: Optional[str] = None
    department: Optional[str] = None
    semester_result: Optional[str] = None
    hobby: Optional[str] = None
    hostel_friends: Optional[str] = None
    non_hostel_friends: Optional[str] = None
    room_number: str = Field(..., min_length=1, max_length=50)
    profile_picture_url: Optional[str] = None

    @field_validator("student_mobile", "parent_mobile", mode="before")
    @classmethod
    def validate_mobile(cls, v):
        if v is None or v == "":
            return v
        cleaned = re.sub(r"[\s\-\(\)]", "", str(v))
        if not re.match(r"^\+?[0-9]{10,15}$", cleaned):
            raise ValueError("Invalid mobile number format")
        return cleaned

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, v):
        if v >= date.today():
            raise ValueError("Date of birth must be in the past")
        return v


class RegistrationResponse(BaseModel):
    id: UUID
    full_name: str
    date_of_birth: date
    student_number: str
    student_mobile: str
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    college_name: Optional[str] = None
    department: Optional[str] = None
    semester_result: Optional[str] = None
    hobby: Optional[str] = None
    hostel_friends: Optional[str] = None
    non_hostel_friends: Optional[str] = None
    floor_number: int
    room_number: str
    profile_picture_url: Optional[str] = None
    registration_status: str
    registered_via_link: Optional[str] = None
    created_by: Optional[UUID] = None
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PendingRegistrationListResponse(BaseModel):
    pending_registrations: List[RegistrationResponse]
    total: int


class LinkDetailResponse(BaseModel):
    id: UUID
    wing_leader_id: Optional[UUID] = None
    wing_leader_name: str
    registration_token: str
    assigned_floor: int
    room_start: str
    room_end: str
    is_active: bool
    created_at: datetime
    shareable_url: str

    model_config = {"from_attributes": True}
