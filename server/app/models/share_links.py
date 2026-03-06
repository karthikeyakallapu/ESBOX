from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class ShareLink(Base) :
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("user_files.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    share_token = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


    file = relationship("UserFile", back_populates="share_links")