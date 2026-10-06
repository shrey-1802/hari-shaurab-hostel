import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime,
    ForeignKey, Text, Enum as SAEnum, JSON
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.core.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="user_role_enum"), nullable=False)
    floor_number = Column(Integer, nullable=True)  # Only for WING_LEADER (4 or 6)
    room_start = Column(String(50), nullable=True)  # e.g. '401', '410', '601', '610'
    room_end = Column(String(50), nullable=True)    # e.g. '409', '418', '609', '618'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    created_students = relationship("Student", back_populates="creator", foreign_keys="Student.created_by")
    notifications = relationship("Notification", back_populates="recipient")
    audit_logs = relationship("AuditLog", back_populates="user")
    browser_subscriptions = relationship("BrowserSubscription", back_populates="user")
    registration_links = relationship("RegistrationLink", back_populates="wing_leader")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role} floor={self.floor_number} rooms={self.room_start}-{self.room_end}>"
