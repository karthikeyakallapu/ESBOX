import asyncio
import math
import os
import time
from typing import BinaryIO, Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from telethon import TelegramClient
from telethon.errors import FloodWaitError
from telethon.tl.functions.channels import CreateChannelRequest
from telethon.tl.functions.upload import SaveBigFilePartRequest
from telethon.tl.types import (InputFileBig,PeerChannel)
from app.logger import logger
from app.models import UserStorageChannel, UserFile
from app.repositories.telegram.storage import storage_repository
from app.services.telegram.client_manager import telegram_client_manager
from app.services.telegram.file_manager import file_manager



class TelegramUploadService:

    SAFE_PART_SIZE_KB = 1024
    DEFAULT_WORKERS = 8
    ULTRA_CONCURRENCY = 20

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

                return channel_id

        except Exception as e:
            logger.error(e)
            await db.rollback()
            raise

    async def _get_storage_location(self, user_id: int, db: AsyncSession):
        try:
            location = await storage_repository.get_storage_location(user_id, db)

            if location and location.channel_id:
                return location.channel_id

            return await self._create_storage_location(user_id, db)

        except Exception as e:
            logger.error(e)
            raise


    async def upload_to_telegram(
        self,
        file: BinaryIO,
        file_name: str,
        file_size: int,
        user_id: int,
        db: AsyncSession,
    ) :

        total_start = time.time()

        client = await telegram_client_manager.get_client(user_id, db)

        if not isinstance(client, TelegramClient):
            raise TypeError(f"Invalid client type: {type(client)}")

        logger.info(
            f"📤 Upload start | file={file_name} | "
            f"size={file_size / 1_000_000:.2f}MB | "
        )

        try:

            chat_id = await self._get_storage_location(user_id, db)

            entity = PeerChannel(int(chat_id))

            upload_start = time.time()

            message = await TelegramUploadService._ultra_fast_upload(
            client, file, file_name, file_size, entity)

            workers_used = TelegramUploadService.ULTRA_CONCURRENCY

            part_size_used = 1024

            upload_time = time.time() - upload_start
            total_time = time.time() - total_start
            speed = file_size / upload_time / 1_000_000

            logger.info(
                f"🎉 Upload complete | time={upload_time:.2f}s | "
                f"speed={speed:.2f}MB/s | workers={workers_used} | part_size={part_size_used}KB"
            )


            result = {
                "status": "success",
                "message_id": message.id,
                "file_id": message.file.id if message.file else None,
                "file_name": file_name,
                "file_size": file_size,
                "upload_time": round(upload_time, 2),
                "total_time": round(total_time, 2),
                "speed_mbps": round(speed, 2),
                "workers": workers_used,
                "part_size_kb": part_size_used,
            }

            return result

        except FloodWaitError as e:
            logger.error(f"⏳ Rate limited | wait={e.seconds}s")
            raise Exception(f"Rate limited. Wait {e.seconds} seconds.")

        except Exception as e:
            logger.error(f"Upload failed: {e}", exc_info=True)
            raise


    @staticmethod
    async def _ultra_fast_upload(
        client: TelegramClient,
        file: BinaryIO,
        file_name: str,
        file_size: int,
        entity
    ):

        part_size = 512 * 1024  # 1MB
        total_parts = math.ceil(file_size / part_size)

        file_id = int.from_bytes(os.urandom(8), "big", signed=True)

        semaphore = asyncio.Semaphore(
            TelegramUploadService.ULTRA_CONCURRENCY
        )

        async def upload_part(index: int, data: bytes):
            async with semaphore:
                await client(
                    SaveBigFilePartRequest(
                        file_id=file_id,
                        file_part=index,
                        file_total_parts=total_parts,
                        bytes=data
                    )
                )

        tasks = []
        part_index = 0

        file.seek(0)

        while True:
            chunk = file.read(part_size)
            if not chunk:
                break

            tasks.append(upload_part(part_index, chunk))
            part_index += 1

        await asyncio.gather(*tasks)

        input_file = InputFileBig(
            id=file_id,
            parts=total_parts,
            name=file_name
        )

        return await client.send_file(
            entity,
            input_file,
            force_document=True
        )


    async def upload_file(self, file_metadata, file, raw_file ,file_hash, user_id: int, db: AsyncSession):
        try:

            upload_file = await file_manager.is_valid_file(raw_file)

            if not upload_file:
                raise HTTPException(status_code=400, detail="Invalid file")


            # Check if file already exists in current folder
            is_duplicate = await storage_repository.is_file_exists(
                file_metadata.parent_id, user_id, db, file_hash
            )

            if is_duplicate:
                raise HTTPException(
                    status_code=409,
                    detail="File already exists in the current folder"
                )

            existing_file = await storage_repository.is_file_exists_in_channel(
                file_metadata.parent_id, user_id, db, file_hash
            )


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
                    parent_id=file_metadata.parent_id
                )

                result=  await storage_repository.save_file_record(
                    user_id, new_metadata, file_hash, db
                )

                return result

            storage_location = await storage_repository.get_storage_location(user_id, db)

            if not storage_location:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No Telegram session found. Please connect your Telegram account first."
                )

            result = await self.upload_to_telegram(
                file=file,
                file_name=upload_file.get("name"),
                file_size=upload_file.get("size"),
                user_id=user_id,
                db=db
            )

            if result.get("status") == "success" :
                user_file = UserFile(user_id= user_id ,
                telegram_message_id = result.get("message_id"),
                telegram_chat_id = str(storage_location.channel_id),
                filename = upload_file["name"],
                file_size = upload_file["size"],
                mime_type = upload_file["type"],
                content_hash = file_hash,
                folder_path = "/",
                parent_id = file_metadata.parent_id
            )
                record =  await storage_repository.save_file_record(user_id, user_file, file_hash, db)
                return record

            return result
        except HTTPException as http_err:
            logger.error(f"HTTP error during file upload: {http_err.detail}")
            raise http_err
        except Exception as err:
            logger.error(f"Unexpected error during file upload: {err}", exc_info=True)
            raise err


upload_service = TelegramUploadService()