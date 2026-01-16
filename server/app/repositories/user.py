from sqlalchemy import select, or_
from app.models.user import User


class UserRepository:

    @staticmethod
    async def check_user_exists(db, email: str, username: str):
        result = await db.execute(
            select(User.email, User.username).where(
                or_(
                    User.email == email,
                    User.username == username
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_email(db, email: str):
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
