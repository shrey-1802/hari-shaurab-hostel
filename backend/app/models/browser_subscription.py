import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base


class BrowserSubscription(Base):
    """
    Stores Web Push (VAPID) subscription objects per user per browser.
    The subscription JSON is stored as text (it's a JSON object from the browser).
    """
    __tablename__ = "browser_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    endpoint = Column(Text, nullable=False, unique=True)
    p256dh = Column(Text, nullable=False)  # Public key from browser subscription
    auth = Column(Text, nullable=False)   # Auth secret from browser subscription
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="browser_subscriptions")

    def __repr__(self):
        return f"<BrowserSubscription user={self.user_id} endpoint={self.endpoint[:40]}...>"
