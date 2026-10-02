from pydantic import BaseModel, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
import re


class StudentBase(BaseModel):
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

    @field_validator("student_mobile", "parent_mobile", mode="before")
    @classmethod
    def validate_mobile(cls, v):
        if v is None:
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


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    student_mobile: Optional[str] = None
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    college_name: Optional[str] = None
    department: Optional[str] = None
    semester_result: Optional[str] = None
    hobby: Optional[str] = None
    hostel_friends: Optional[str] = None
    non_hostel_friends: Optional[str] = None
    floor_number: Optional[int] = None
    room_number: Optional[str] = None


class StudentResponse(StudentBase):
    id: UUID
    profile_picture_url: Optional[str] = None
    created_by: Optional[UUID] = None
    creator_name: Optional[str] = None
    creator_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StudentListResponse(BaseModel):
    students: List[StudentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class StudentSearchParams(BaseModel):
    search: Optional[str] = None  # name, room_number, student_number
    floor: Optional[int] = None
    department: Optional[str] = None
    page: int = 1
    page_size: int = 20

    @field_validator("page")
    @classmethod
    def validate_page(cls, v):
        if v < 1:
            raise ValueError("Page must be >= 1")
        return v

    @field_validator("page_size")
    @classmethod
    def validate_page_size(cls, v):
        if v < 1 or v > 100:
            raise ValueError("Page size must be between 1 and 100")
        return v


class BirthdayStudentResponse(BaseModel):
    id: UUID
    full_name: str
    date_of_birth: date
    floor_number: int
    room_number: str
    student_mobile: str
    profile_picture_url: Optional[str] = None
    days_until_birthday: int

    model_config = {"from_attributes": True}
