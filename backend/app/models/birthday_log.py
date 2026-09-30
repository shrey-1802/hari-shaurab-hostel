import uuid
from datetime import datetime, timezone, date
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class BirthdayLog(Base):
    """
    Tracks which birthday notifications have already been sent,
    preventing duplicate alerts on scheduler re-runs.
    """
    __tablename__ = "birthday_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    notification_date = Column(Date, nullable=False)   # The date the notification was sent
    birthday_date = Column(Date, nullable=False)        # The actual birthday
    notification_type = Column(String(50), nullable=False)  # "today" or "tomorrow"
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("Student", back_populates="birthday_logs")

    def __repr__(self):
        return f"<BirthdayLog student={self.student_id} date={self.notification_date} type={self.notification_type}>"
