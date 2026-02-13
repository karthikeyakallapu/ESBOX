from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.logger import logger
from app.models import UserStorageChannel, UserFile


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

    @staticmethod
    async def is_file_exists(parent_id ,user_id, db, file_hash):
        try:
            result = await db.execute(
                select(UserFile).where(
                    UserFile.user_id == user_id,
                    UserFile.content_hash == file_hash,
                    UserFile.parent_id == parent_id
                )
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(e)
            raise

    @staticmethod
    async def is_file_exists_in_channel(parent_id, user_id, db, file_hash):
        try:
            result = await db.execute(
                select(UserFile).where(
                    UserFile.user_id == user_id,
                    UserFile.content_hash == file_hash)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(e)
            raise

    @staticmethod
    async def save_file_record(user_id, file_metadata, file_hash, db):
        try:
            new_file = UserFile(
                user_id=user_id,
                telegram_message_id=file_metadata.telegram_message_id,
                telegram_chat_id=file_metadata.telegram_chat_id,
                filename=file_metadata.filename,
                file_size=file_metadata.file_size,
                mime_type=file_metadata.mime_type,
                content_hash=file_hash,
                folder_path=file_metadata.folder_path,
                parent_id=file_metadata.parent_id
            )
            db.add(new_file)
            await db.commit()
            await db.refresh(new_file)
            return new_file
        except Exception as e:
            logger.error(e)
            raise

    @staticmethod
    async def get_files_in_folder(parent_id, user_id, db):
        try:
            result = await db.execute(
                select(UserFile.id, UserFile.file_size, UserFile.filename, UserFile.mime_type, UserFile.updated_at
                       , UserFile.uploaded_at).where(
                    UserFile.user_id == user_id,
                    UserFile.parent_id == parent_id
                )
            )
            return result.mappings().all()

        except Exception as e:
            logger.error(e)
            raise


storage_repository = TelegramStorageRepository()