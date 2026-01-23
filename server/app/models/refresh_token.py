from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    revoked = Column(Boolean, default=False)
    device_info = Column(String, nullable=True)

    user = relationship("User", back_populates="refresh_tokens")
