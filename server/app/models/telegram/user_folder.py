from sqlalchemy import Column, Integer, ForeignKey, Boolean, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class UserFolder(Base):
    __tablename__ = "user_folders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_root = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    name = Column(String(64), index=True)
    parent_id = Column(Integer, ForeignKey("user_folders.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="folders")
    # Self-referencing relationships for folder hierarchy
    parent = relationship("UserFolder", remote_side=[id], back_populates="children")
    children = relationship("UserFolder", back_populates="parent", cascade="all, delete-orphan")
