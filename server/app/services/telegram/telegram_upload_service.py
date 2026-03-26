import asyncio
import math
import os
import time
from typing import BinaryIO

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
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
from app.storage import storage
from app.db.db import AsyncSessionLocal


class TelegramUploadService:

    SAFE_PART_SIZE_KB = 1024
    DEFAULT_WORKERS = 4
    UPLOAD_CONCURRENCY = 12       # Concurrent Telegram part uploads
    PART_DELAY_SECONDS = 0.0      # No artificial delay — rely on semaphore + retry backoff

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

            workers_used = TelegramUploadService.UPLOAD_CONCURRENCY

            part_size_used = 512

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
                "chat_id": str(chat_id),
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
        part_size = 512 * 1024  # 512 KB — Telegram maximum part size

        file_id = int.from_bytes(os.urandom(8), "big", signed=True)

        # Pre-read all parts so total_parts is accurate (needed by the API).
        # We read lazily in a thread so we don't block the event loop.
        loop = asyncio.get_running_loop()
        parts: list[bytes] = await loop.run_in_executor(
            None,
            lambda: [chunk for chunk in iter(lambda: file.read(part_size), b"")]
        )
        total_parts = len(parts)

        semaphore = asyncio.Semaphore(TelegramUploadService.UPLOAD_CONCURRENCY)

        async def upload_part(index: int, data: bytes):
            async with semaphore:
                retries = 5
                for attempt in range(retries):
                    try:
                        await client(
                            SaveBigFilePartRequest(
                                file_id=file_id,
                                file_part=index,
                                file_total_parts=total_parts,
                                bytes=data
                            )
                        )
                        return
                    except FloodWaitError as e:
                        wait = e.seconds + 1
                        logger.warning(f"⏳ Flood wait on part {index}, sleeping {wait}s (attempt {attempt + 1}/{retries})")
                        await asyncio.sleep(wait)
                    except Exception:
                        if attempt == retries - 1:
                            raise
                        await asyncio.sleep(0.5 * (attempt + 1))

        # Upload ALL parts concurrently (bounded by semaphore) — no batching overhead
        await asyncio.gather(*[upload_part(i, data) for i, data in enumerate(parts)])

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
                    name=existing_file.name,
                    size=existing_file.size,
                    mime_type=existing_file.mime_type,
                    content_hash=existing_file.content_hash,
                    folder_path=existing_file.folder_path,
                    parent_id=file_metadata.parent_id
                )

                result=  await storage_repository.save_file_record(
                    user_id, new_metadata, file_hash, db
                )

                return result

            result = await self.upload_to_telegram(
                file=file,
                file_name=upload_file.get("name"),
                file_size=upload_file.get("size"),
                user_id=user_id,
                db=db
            )

            if result.get("status") == "success" :
                chat_id = result.get("chat_id")
                if not chat_id:
                    storage_location = await storage_repository.get_storage_location(user_id, db)
                    if not storage_location:
                        raise HTTPException(
                            status_code=500,
                            detail="Storage channel was not found after upload."
                        )
                    chat_id = str(storage_location.channel_id)

                user_file = UserFile(user_id= user_id ,
                telegram_message_id = result.get("message_id"),
                telegram_chat_id = chat_id,
                name = upload_file["name"],
                size = upload_file["size"],
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


    async def ultra_fast_stream_upload(
            self,
            generator,
            file_name: str,
            file_size: int,
            user_id: int,
            db: AsyncSession,
            on_progress=None,   # optional async callable(percent: float, message: str)
    ):
        client = await telegram_client_manager.get_client(user_id, db)

        if not isinstance(client, TelegramClient):
            raise TypeError(f"Invalid client type: {type(client)}")

        logger.info(
            f"📤 Upload start | file={file_name} | "
            f"size={file_size / 1_000_000:.2f}MB"
        )

        try:
            chat_id = await self._get_storage_location(user_id, db)
            entity = PeerChannel(int(chat_id))

            part_size = 512 * 1024  # 512 KB — Telegram maximum
            file_id = int.from_bytes(os.urandom(8), "big", signed=True)

            # ── Compute total_parts upfront from file_size ──────────────────
            total_parts = math.ceil(file_size / part_size)

            logger.info(
                f"Streaming | size={file_size / 1_000_000:.1f}MB | "
                f"parts={total_parts} | part_size={part_size // 1024}KB | "
                f"concurrency={TelegramUploadService.UPLOAD_CONCURRENCY}"
            )

            # ── Producer/consumer pipeline ───────────────────────────────────
            # The generator (MinIO reads) produces parts into a bounded queue.
            # Telegram upload workers consume from that queue concurrently.
            # Both sides run truly in parallel — MinIO and Telegram I/O overlap.

            QUEUE_DEPTH = TelegramUploadService.UPLOAD_CONCURRENCY * 2
            queue: asyncio.Queue[tuple[int, bytes] | None] = asyncio.Queue(maxsize=QUEUE_DEPTH)

            upload_semaphore = asyncio.Semaphore(TelegramUploadService.UPLOAD_CONCURRENCY)
            completed_parts = 0
            progress_interval = max(1, total_parts // 20)   # report every ~5 %

            # ── Producer: read generator → assemble 512 KB parts → enqueue ──
            async def producer():
                buffer = b""
                index = 0
                async for chunk in generator:
                    buffer += chunk
                    while len(buffer) >= part_size:
                        await queue.put((index, buffer[:part_size]))
                        buffer = buffer[part_size:]
                        index += 1
                if buffer:
                    await queue.put((index, buffer))
                    index += 1
                # Signal consumers that production is done
                for _ in range(TelegramUploadService.UPLOAD_CONCURRENCY):
                    await queue.put(None)

            # ── Consumer: dequeue parts → upload to Telegram ─────────────────
            async def consumer():
                nonlocal completed_parts
                while True:
                    item = await queue.get()
                    if item is None:
                        queue.task_done()
                        return
                    index, data = item
                    try:
                        async with upload_semaphore:
                            retries = 5
                            for attempt in range(retries):
                                try:
                                    await client(
                                        SaveBigFilePartRequest(
                                            file_id=file_id,
                                            file_part=index,
                                            file_total_parts=total_parts,
                                            bytes=data,
                                        )
                                    )
                                    completed_parts += 1
                                    if on_progress and (
                                        completed_parts % progress_interval == 0
                                        or completed_parts == total_parts
                                    ):
                                        pct = 15 + round((completed_parts / total_parts) * 75, 1)
                                        await on_progress(
                                            pct,
                                            f"Uploading… {round(completed_parts / total_parts * 100)}%"
                                        )
                                    break
                                except FloodWaitError as e:
                                    wait = e.seconds + 1
                                    logger.warning(
                                        f"⏳ Flood wait on part {index}, sleeping {wait}s "
                                        f"(attempt {attempt + 1}/{retries})"
                                    )
                                    await asyncio.sleep(wait)
                                except Exception:
                                    if attempt == retries - 1:
                                        raise
                                    await asyncio.sleep(0.5 * (attempt + 1))
                    finally:
                        queue.task_done()

            # Run producer + N consumers concurrently
            consumers = [
                asyncio.ensure_future(consumer())
                for _ in range(TelegramUploadService.UPLOAD_CONCURRENCY)
            ]
            await asyncio.gather(producer(), *consumers)

            input_file = InputFileBig(id=file_id, parts=total_parts, name=file_name)
            return await client.send_file(entity, input_file, force_document=True)

        except FloodWaitError as e:
            logger.error(f"⏳ Rate limited | wait={e.seconds}s")
            raise Exception(f"Rate limited. Wait {e.seconds} seconds.")
        except Exception as e:
            logger.error(f"Upload failed: {e}", exc_info=True)
            raise


    @staticmethod
    async def merged_stream(storage, upload_id: str, total_chunks: int, prefetch: int = 4):
        """
        Yield 512 KB Telegram parts assembled from MinIO chunks.

        *prefetch* chunks are downloaded from MinIO in parallel while the
        previous chunk is being consumed, eliminating the sequential
        MinIO-download → Telegram-upload pipeline stall.
        """
        loop = asyncio.get_running_loop()
        semaphore = asyncio.Semaphore(prefetch)

        async def _fetch(i: int) -> bytes:
            async with semaphore:
                return await storage.get_chunk_bytes(upload_id, i)

        # Start all fetches immediately; asyncio.gather preserves order
        chunk_futures = [asyncio.ensure_future(_fetch(i)) for i in range(total_chunks)]

        for fut in chunk_futures:
            data = await fut
            yield data



    async def process_upload(self, upload_id: str, meta: dict, user_id: int):
        """Run as a background task with its own DB session."""
        try:
            async with AsyncSessionLocal() as db:
                generator = self.merged_stream(
                    storage,
                    upload_id,
                    meta["total_chunks"]
                )

                await self.ultra_fast_stream_upload(
                    generator=generator,
                    file_name=meta["file_name"],
                    file_size=meta["file_size"],
                    user_id=user_id,
                    db=db
                )

                # 🔥 CLEANUP AFTER SUCCESS
                await storage.delete_upload(upload_id)

        except Exception as e:
            logger.error(f"Background upload failed for upload_id={upload_id}: {e}", exc_info=True)


    async def process_chunked_upload(self, upload_id: str, meta: dict, user_id: int):
        """
        Background job: stream chunks from MinIO → upload to Telegram → save DB record → cleanup.
        Updates Redis progress throughout so the client can poll /upload/status.
        """
        from app.services.upload.upload_state import upload_state

        try:
            async with AsyncSessionLocal() as db:
                file_name = meta["file_name"]
                file_size = meta["file_size"]
                mime_type = meta.get("mime_type", "application/octet-stream")
                content_hash = meta.get("content_hash", "")
                parent_id = meta.get("parent_id")
                if parent_id == "":
                    parent_id = None
                else:
                    parent_id = int(parent_id) if parent_id else None
                total_chunks = meta["total_chunks"]

                # ── 1. Ensure all chunks are available in MinIO ──
                upload_state.update_processing_progress(upload_id, 5, "Validating chunks…")
                await storage.wait_for_all_chunks(upload_id, total_chunks)

                # ── 2. Check for duplicate files ──
                upload_state.update_processing_progress(upload_id, 10, "Checking duplicates…")

                existing_file = await storage_repository.is_file_exists(
                    parent_id, user_id, db, content_hash
                )
                if existing_file:
                    upload_state.set_failed(upload_id, "File already exists in the current folder")
                    await storage.delete_upload(upload_id)
                    upload_state.cleanup(upload_id)
                    return

                # Check for same file elsewhere in channel (dedup at storage level)
                channel_file = await storage_repository.is_file_exists_in_channel(
                    parent_id, user_id, db, content_hash
                )

                if channel_file:
                    # Reuse existing Telegram upload — just create a new DB record
                    new_metadata = UserFile(
                        user_id=channel_file.user_id,
                        telegram_message_id=channel_file.telegram_message_id,
                        telegram_chat_id=channel_file.telegram_chat_id,
                        name=file_name,
                        size=channel_file.size,
                        mime_type=channel_file.mime_type,
                        content_hash=channel_file.content_hash,
                        folder_path=channel_file.folder_path,
                        parent_id=parent_id,
                    )
                    record = await storage_repository.save_file_record(
                        user_id, new_metadata, content_hash, db
                    )
                    file_record = {
                        "id": record.id,
                        "name": record.name,
                        "size": record.size,
                        "mime_type": record.mime_type,
                        "parent_id": record.parent_id,
                    }
                    upload_state.set_completed(upload_id, file_record)
                    await storage.delete_upload(upload_id)
                    upload_state.cleanup(upload_id)
                    logger.info(f"Dedup match — reused Telegram file for upload_id={upload_id}")
                    return

                # ── 3. Stream from MinIO → Telegram ──
                upload_state.update_processing_progress(upload_id, 15, "Uploading to Telegram…")

                generator = self.merged_stream(storage, upload_id, total_chunks)

                async def on_progress(pct: float, msg: str):
                    upload_state.update_processing_progress(upload_id, pct, msg)

                message = await self.ultra_fast_stream_upload(
                    generator=generator,
                    file_name=file_name,
                    file_size=file_size,
                    user_id=user_id,
                    db=db,
                    on_progress=on_progress,
                )

                upload_state.update_processing_progress(upload_id, 85, "Saving file record…")

                # ── 4. Save DB record ──
                chat_id = None
                storage_location = await storage_repository.get_storage_location(user_id, db)
                if storage_location:
                    chat_id = str(storage_location.channel_id)

                user_file = UserFile(
                    user_id=user_id,
                    telegram_message_id=message.id,
                    telegram_chat_id=chat_id or "",
                    name=file_name,
                    size=file_size,
                    mime_type=mime_type,
                    content_hash=content_hash,
                    folder_path="/",
                    parent_id=parent_id,
                )
                record = await storage_repository.save_file_record(
                    user_id, user_file, content_hash, db
                )

                file_record = {
                    "id": record.id,
                    "name": record.name,
                    "size": record.size,
                    "mime_type": record.mime_type,
                    "parent_id": record.parent_id,
                }

                # ── 5. Cleanup MinIO chunks ──
                upload_state.update_processing_progress(upload_id, 95, "Cleaning up…")
                await storage.delete_upload(upload_id)

                # ── 6. Done ──
                upload_state.set_completed(upload_id, file_record)
                upload_state.cleanup(upload_id)
                logger.info(f"✅ Chunked upload complete | upload_id={upload_id} | file_id={record.id}")

        except Exception as e:
            logger.error(f"Background chunked upload failed | upload_id={upload_id}: {e}", exc_info=True)
            try:
                upload_state.set_failed(upload_id, str(e))
            except Exception:
                pass

upload_service = TelegramUploadService()
