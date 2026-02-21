from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from telethon.tl.functions.channels import CreateChannelRequest
from telethon.tl.types import PeerChannel, DocumentAttributeFilename

from app.logger import logger
from app.models import UserStorageChannel, UserFile
from app.repositories.telegram.storage import  storage_repository
from app.services.telegram.client_manager import telegram_client_manager
from app.services.telegram.file_manager import file_manager


class TelegramStorageService:

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
                await db.refresh(storage_channel)
        except Exception as e:
            logger.error(e)

    async def _get_storage_location(self, user_id: int, db: AsyncSession):
        try:
            location = await storage_repository.get_storage_location(user_id, db)

            if location and location.channel_id:
                return location.channel_id

            channel_id = await self._create_storage_location(user_id, db)

            return channel_id
        except Exception as e:
            logger.error(e)

    async def upload_file(self, file_metadata ,user_id: int, db: AsyncSession, file: UploadFile):
            try:
                # Check if user has a Telegram session before proceeding
                has_session = await telegram_client_manager.has_session(user_id, db)
                if not has_session:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="No Telegram session found. Please connect your Telegram account first."
                    )

                buffer, file_hash = None, None

                upload_file = await file_manager.is_valid_file(file)

                if upload_file:
                    buffer, file_hash = await file_manager.get_file_buffer(file)

                if await storage_repository.is_file_exists(file_metadata.parent_id, user_id, db, file_hash):
                    raise  HTTPException(status_code=status.HTTP_409_CONFLICT, detail="File already exists in the current folder")

                existing_file = await storage_repository.is_file_exists_in_channel(file_metadata.parent_id, user_id, db,
                                                                            file_hash)

                if existing_file:
                    new_metadata = UserFile(
                        user_id=existing_file.user_id,
                        telegram_message_id=existing_file.telegram_message_id,
                        telegram_chat_id=existing_file.telegram_chat_id,
                        filename=existing_file.filename,
                        file_size=existing_file.file_size,
                        mime_type=existing_file.mime_type,
                        content_hash=existing_file.content_hash,
                        folder_path=existing_file.folder_path,
                        parent_id=file_metadata.parent_id  # New parent_id
                    )
                    result = await storage_repository.save_file_record(user_id, new_metadata, file_hash, db)
                    return result

                storage_location = await self._get_storage_location(user_id, db)

                client = await telegram_client_manager.get_client(user_id, db)

                entity = PeerChannel(storage_location)

                buffer.seek(0)
                buffer.name = upload_file["name"]

                message = await client.send_file(
                    entity=entity,
                    file=buffer,
                    caption=upload_file["name"],
                    force_document=True,
                    attributes=[DocumentAttributeFilename(file_name=upload_file["name"])],
                    supports_streaming=True,
                    mime_type=upload_file["type"]
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
                        folder_path="/",
                        parent_id=file_metadata.parent_id
                    )

                    result = await storage_repository.save_file_record(user_id, user_file, file_hash, db)

                    return result

            except HTTPException  as e:
                raise e
            except Exception as e:
                logger.error(e)
                await db.rollback()
                raise e

    @staticmethod
    async def remove_files_from_channel(user_id: int, db: AsyncSession, file_hashes: list):
        try:
            client = await telegram_client_manager.get_client(user_id, db)

            for file_hash in file_hashes:
                existing_file = await storage_repository.is_file_exists_in_channel(None, user_id, db, file_hash)

                if existing_file:

                    entity = PeerChannel(int(existing_file.telegram_chat_id))

                    result = await client.delete_messages(
                        entity,
                        [existing_file.telegram_message_id],
                        revoke=True
                     )

                    return result

            return None
        except Exception as e:
            logger.error(e)
            raise e



tele_storage_service = TelegramStorageService()
