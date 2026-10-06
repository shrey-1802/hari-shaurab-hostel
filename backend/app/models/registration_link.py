import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class RegistrationLink(Base):
    __tablename__ = "registration_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    wing_leader_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    wing_leader_name = Column(String(255), nullable=False)
    registration_token = Column(String(100), unique=True, nullable=False, index=True)
    assigned_floor = Column(Integer, nullable=False)
    room_start = Column(String(30), nullable=False)
    room_end = Column(String(30), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    wing_leader = relationship("User", back_populates="registration_links", foreign_keys=[wing_leader_id])

    def __repr__(self):
        return f"<RegistrationLink token={self.registration_token} floor={self.assigned_floor} rooms={self.room_start}-{self.room_end}>"
