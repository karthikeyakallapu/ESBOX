from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.logger import logger
from app.models import UserStorageChannel


class TelegramStorageRepository:

    @staticmethod
    async def get_storage_location(user_id: int, db: AsyncSession) -> UserStorageChannel | None:
        try:
            result = await db.execute(
                select(UserStorageChannel).where(UserStorageChannel.user_id == user_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching storage location for user {user_id}: {e}")
            raise
