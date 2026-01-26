import os

from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from telethon.tl.functions.channels import CreateChannelRequest

from app.logger import logger
from app.models import UserStorageChannel
from app.repositories.telegram.storage import TelegramStorageRepository
from app.services.telegram.client_manager import telegram_client_manager

# Configuration
MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024  # 2GB
ALLOWED_EXTENSIONS = None  # None = all allowed, or set ['.pdf', '.jpg', ...]


class TelegramStorageService:
    def __init__(self):
        self.storage_repo = TelegramStorageRepository()

    @staticmethod
    async def _create_storage_location(user_id, db):
        try:
            client = await telegram_client_manager.get_client(user_id, db)

            channel_result = await client(CreateChannelRequest(
                title="ESBox",
                about="ESBox Storage Channel",
                megagroup=False
            ))

            if channel_result and channel_result.chats:
                channel_id = channel_result.chats[0].id
                storage_channel = UserStorageChannel(
                    user_id=user_id,
                    channel_id=channel_id
                )
                await db.add(storage_channel)
                await db.commit()
        except Exception as e:
            logger.error(e)

    async def _get_storage_location(self, user_id: int, db: AsyncSession):
        try:
            location = await self.storage_repo.get_storage_location(user_id, db)

            if location and location.channel_id:
                return location.channel_id

            channel_id = await self._create_storage_location(user_id, db)

            return channel_id
        except Exception as e:
            logger.error(e)

    @staticmethod
    async def upload_file(user_id: int, db: AsyncSession, file: UploadFile):

        # Validate file size (read in chunks to avoid loading entire file in memory)
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks

        # Save to temporary file while checking size
        temp_file_path = os.getcwd() + "\\" + f"{user_id}_{file.filename}"

        try:
            with open(temp_file_path, "wb") as temp_file:
                while True:
                    chunk = await file.read(chunk_size)
                    if not chunk:
                        break

                    file_size += len(chunk)

                    # Check size limit
                    if file_size > MAX_FILE_SIZE:
                        # Cleanup and raise error
                        if os.path.exists(temp_file_path):
                            os.remove(temp_file_path)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 ** 3):.1f}GB"
                        )

                    temp_file.write(chunk)
        except Exception as e:
            logger.error(e)
            raise e


tele_storage_service = TelegramStorageService()
