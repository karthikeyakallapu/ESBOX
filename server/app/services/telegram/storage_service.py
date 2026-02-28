from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from telethon.tl.types import PeerChannel
from app.logger import logger
from app.models import UserFile
from app.repositories.telegram.storage import storage_repository
from app.services.telegram.client_manager import telegram_client_manager


class TelegramStorageService:

    @staticmethod
    async def remove_files_from_channel(user_id: int, db: AsyncSession, file_hashes: list):
        try:
            client = await telegram_client_manager.get_client(user_id, db)
            results = []

            for file_hash in file_hashes:

                existing_file = await storage_repository.is_file_exists_in_channel(
                    None, user_id, db, file_hash
                )

                if not existing_file:
                    continue

                entity = PeerChannel(int(existing_file.telegram_chat_id))

                result = await client.delete_messages(
                    entity,
                    [existing_file.telegram_message_id],
                    revoke=True
                )

                results.append(result)

            return results if results else None

        except Exception as e:
            logger.error(e)
            raise

    @staticmethod
    async def get_telegram_message(file_id: int, user_id: int, db):

        file = await db.get(UserFile, file_id)

        if not file or file.user_id != user_id:
            raise HTTPException(status_code=404, detail="File not found")

        client = await telegram_client_manager.get_client(user_id, db)

        entity = PeerChannel(int(file.telegram_chat_id))

        message = await client.get_messages( entity,  ids=file.telegram_message_id)

        if not message or not message.file:
            raise HTTPException(status_code=404, detail="Telegram file missing")

        return client, file, message

tele_storage_service = TelegramStorageService()