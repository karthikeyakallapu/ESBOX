from sqlalchemy import Column, Integer, ForeignKey, Boolean, String, DateTime, func

from app.db.base_class import Base


class UserFolder(Base):
    __tablename__ = "user_folders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_root = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    name = Column(String(64), index=True)
    parent_id = Column(Integer, ForeignKey("user_folders.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
