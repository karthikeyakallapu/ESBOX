from sqlalchemy import Column, Integer, ForeignKey, String, BigInteger, func, DateTime

from app.db.base_class import Base


class UserFile(Base):
    __tablename__ = "user_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    telegram_message_id = Column(Integer, nullable=False)
    telegram_chat_id = Column(String(50), nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String(100))
    content_hash = Column(String(64), index=True)  # SHA256
    folder_path = Column(String(500), default="/")
    parent_id = Column(Integer, ForeignKey("user_folders.id"))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
