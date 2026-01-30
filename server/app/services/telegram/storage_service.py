from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from telethon.tl.functions.channels import CreateChannelRequest
from telethon.tl.types import PeerChannel

from app.logger import logger
from app.models import UserStorageChannel, UserFile
from app.repositories.telegram.storage import TelegramStorageRepository
from app.services.telegram.client_manager import telegram_client_manager
from app.services.telegram.file_manager import file_manager


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
                db.add(storage_channel)
                await db.commit()
                db.refresh(storage_channel)
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

    async def upload_file(self, user_id: int, db: AsyncSession, file: UploadFile):

        upload_file = await file_manager.is_valid_file(file)

        if upload_file:
            buffer, file_hash = await file_manager.get_file_buffer(file)

            if await self.storage_repo.is_file_exists(user_id, db, file_hash):
                return {
                    'success': True,
                    'duplicate': True,
                    'message': 'File already exists'
                }

            try:
                storage_location = await self._get_storage_location(user_id, db)

                client = await telegram_client_manager.get_client(user_id, db)

                entity = PeerChannel(storage_location)

                message = await client.send_file(
                    entity=entity,
                    file=buffer,
                    file_name=upload_file["name"],
                    supports_streaming=True,
                    force_document=True,
                )

                if message:
                    user_file = UserFile(
                        user_id=user_id,
                        telegram_message_id=message.id,
                        telegram_chat_id=str(storage_location),
                        filename=upload_file["name"],
                        file_size=upload_file["size"],
                        mime_type=upload_file["type"],
                        content_hash=file_hash,
                        folder_path="/")

                    db.add(user_file)
                    await db.commit()
                    await db.refresh(user_file)

                    return {
                        'success': True,
                        'file_id': user_file.id,
                        'filename': user_file.filename,
                        'size': user_file.file_size,
                        'mime_type': user_file.mime_type,
                        'telegram_message_id': message.id,
                        'uploaded_at': user_file.uploaded_at,
                        'message': 'File uploaded successfully'
                    }

            except Exception as e:
                logger.error(e)
                await db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Error Uploading File"
                )

        return None


tele_storage_service = TelegramStorageService()
