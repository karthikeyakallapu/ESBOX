from sqlalchemy import select, or_, func

from app.models import UserToken
from app.models.user import User

class UserRepository:

    @staticmethod
    async def check_user_exists(db, email: str, username: str):
        result = await db.execute(
            select(User).where(
                or_(
                    User.email == email,
                    User.username == username
                )
            )
        )
        return result.scalars().first()

    @staticmethod
    async def get_user_by_email(db, email: str):
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db, user_id: int):
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user_token(db,user_id,token_hash, token_type, expires_at):
        token = UserToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            token_type=token_type
        )

        db.add(token)
        await db.commit()
        await db.refresh(token)
        return token

    @staticmethod
    async def is_valid_token(db, token_hash: str ,token_type: str):
        result = await db.execute(
            select(UserToken).where(
                UserToken.token_hash == token_hash,
                UserToken.token_type == token_type,
                UserToken.is_used == False,
                UserToken.expires_at > func.now()
            )
        )
        return result.scalar_one_or_none()
