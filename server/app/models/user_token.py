from sqlalchemy import Integer, Column, ForeignKey, String, DateTime, Boolean, func

from app.db.base_class import Base


class UserToken(Base):
    __tablename__ = "user_tokens"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    token_hash = Column(String(64), nullable=False, unique=True)

    token_type = Column(String(20), nullable=False, index=True)

    expires_at = Column(DateTime(timezone=True), nullable=False)

    is_used = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True),  server_default=func.now())