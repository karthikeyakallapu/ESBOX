from sqlalchemy import Column, Integer, ForeignKey, BigInteger, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class UserStorageChannel(Base):
    __tablename__ = 'user_storage_channels'
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True)

    channel_id = Column(BigInteger, nullable=False, index=True)
    channel_title = Column(String, default='ESBox', nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    file_count = Column(BigInteger, nullable=False, default=0)
    total_size = Column(BigInteger, nullable=False, default=0)

    # Relationships
    user = relationship("User", back_populates="user_storage_channels")
