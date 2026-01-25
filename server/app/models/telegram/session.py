from sqlalchemy import Column, Integer, ForeignKey, Text, BigInteger, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class TelegramSession(Base):
    __tablename__ = 'telegram_sessions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    encrypted_session = Column(Text, nullable=False)
    telegram_user_id = Column(BigInteger, unique=True, nullable=False, index=True)
    phone_number = Column(String(20), nullable=False)
    first_name = Column(String(100), default="")
    last_name = Column(String(100), default="")
    username = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    has_2fa = Column(Boolean, default=False)

    last_connected = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="telegram_sessions")
