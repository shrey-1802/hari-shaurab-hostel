import uuid
from datetime import datetime, timezone, date
from sqlalchemy import (
    Column, String, Integer, DateTime, Date,
    ForeignKey, Text, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Personal Info
    full_name = Column(String(255), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    student_number = Column(String(100), unique=True, nullable=False, index=True)
    student_mobile = Column(String(20), nullable=False)

    # Parent Info
    parent_name = Column(String(255), nullable=True)
    parent_mobile = Column(String(20), nullable=True)

    # Academic Info
    college_name = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    semester_result = Column(String(100), nullable=True)

    # Social Info
    hobby = Column(Text, nullable=True)
    hostel_friends = Column(Text, nullable=True)
    non_hostel_friends = Column(Text, nullable=True)

    # Hostel Info
    floor_number = Column(Integer, nullable=False, index=True)
    room_number = Column(String(50), nullable=False, index=True)

    # Profile Picture
    profile_picture_url = Column(String(500), nullable=True)
    profile_picture_path = Column(String(500), nullable=True)  # Supabase storage path

    # Self Registration & Approval Info
    registration_status = Column(String(50), default="APPROVED", nullable=False, index=True) # PENDING, APPROVED, REJECTED
    registered_via_link = Column(String(100), nullable=True)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    registration_source = Column(String(50), default="MANUAL", nullable=False) # MANUAL, SELF_REGISTRATION

    # Metadata
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    creator = relationship("User", back_populates="created_students", foreign_keys=[created_by], lazy="joined")
    approver = relationship("User", foreign_keys=[approved_by], lazy="select")
    birthday_logs = relationship("BirthdayLog", back_populates="student")

    @property
    def creator_name(self) -> str | None:
        return self.creator.full_name if self.creator else None

    @property
    def creator_email(self) -> str | None:
        return self.creator.email if self.creator else None

    def __repr__(self):
        return f"<Student id={self.id} name={self.full_name} floor={self.floor_number} room={self.room_number}>"
