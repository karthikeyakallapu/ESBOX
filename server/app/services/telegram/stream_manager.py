import asyncio
import time
from collections import OrderedDict
from typing import Any, Optional

from telethon.tl.types import PeerChannel

from app.logger import logger
from app.services.telegram.client_manager import telegram_client_manager


class StreamManager:
    def __init__(self):
        # Optional Redis cache hooks (currently disabled in this implementation)
        self.redis = None

        # Chunk cache settings (legacy knobs retained)
        self.cache_ttl = 3600
        self.cache_max_file_size = 50 * 1024 * 1024

        # Short-lived media metadata cache to avoid repeated get_messages calls
        # during consecutive HTTP range requests for the same file.
        self._message_cache_ttl = 300  # 5 minutes
        self._message_cache_max_items = 500
        self._message_cache: OrderedDict[str, tuple[Any, Optional[int], Optional[str], float]] = OrderedDict()
        self._message_cache_lock = asyncio.Lock()

    @staticmethod
    def get_cache_key(chat_id: int, message_id: int, offset: int) -> str:
        return f"tg_chunk:{chat_id}:{message_id}:{offset}"

    async def get_cached_chunk(
        self,
        chat_id: int,
        message_id: int,
        offset: int,
    ) -> Optional[bytes]:
        if not self.redis:
            return None

        try:
            cache_key = self.get_cache_key(chat_id, message_id, offset)
            cached = await self.redis.get(cache_key)
            if cached:
                logger.info(f"Cache HIT: {cache_key}")
                return cached
            logger.debug(f"Cache MISS: {cache_key}")
            return None
        except Exception as e:
            logger.warning(f"Cache error: {e}")
            return None

    async def cache_chunk(
        self,
        chat_id: int,
        message_id: int,
        offset: int,
        data: bytes,
    ):
        if not self.redis:
            return

        try:
            cache_key = self.get_cache_key(chat_id, message_id, offset)
            await self.redis.setex(cache_key, self.cache_ttl, data)
            logger.debug(f"Cached: {cache_key} ({len(data)} bytes)")
        except Exception as e:
            logger.warning(f"Failed to cache: {e}")

    @staticmethod
    def get_optimal_chunk_size(file_size: int, mime_type: str = None) -> int:
        is_video = mime_type.startswith("video/") if mime_type else False

        if is_video:
            if file_size < 50_000_000:
                return 4 * 1024 * 1024
            if file_size < 200_000_000:
                return 8 * 1024 * 1024
            return 10 * 1024 * 1024

        if file_size < 10_000_000:
            return 1 * 1024 * 1024
        if file_size < 100_000_000:
            return 2 * 1024 * 1024
        return 5 * 1024 * 1024

    @staticmethod
    def _message_cache_key(user_id: int, chat_id: int, telegram_message_id: int) -> str:
        return f"{user_id}:{chat_id}:{telegram_message_id}"

    async def _get_cached_message_media(
        self,
        user_id: int,
        chat_id: int,
        telegram_message_id: int,
        client,
        force_refresh: bool = False,
    ) -> tuple[Any, Optional[int], Optional[str]]:
        cache_key = self._message_cache_key(user_id, chat_id, telegram_message_id)
        now = time.time()

        if not force_refresh:
            async with self._message_cache_lock:
                cached = self._message_cache.get(cache_key)
                if cached:
                    media, cached_size, cached_mime, ts = cached
                    if now - ts <= self._message_cache_ttl:
                        self._message_cache.move_to_end(cache_key)
                        return media, cached_size, cached_mime
                    del self._message_cache[cache_key]

        entity = PeerChannel(int(chat_id))
        message = await client.get_messages(entity, ids=telegram_message_id)
        if not message or not message.media:
            raise ValueError(
                f"Message or media not found for chat_id {chat_id} and message_id {telegram_message_id}"
            )

        fetched_size = message.file.size if getattr(message, "file", None) else None
        fetched_mime = message.file.mime_type if getattr(message, "file", None) else None

        async with self._message_cache_lock:
            self._message_cache[cache_key] = (message.media, fetched_size, fetched_mime, now)
            self._message_cache.move_to_end(cache_key)
            while len(self._message_cache) > self._message_cache_max_items:
                self._message_cache.popitem(last=False)

        return message.media, fetched_size, fetched_mime

    async def stream_file(
        self,
        chat_id: int,
        telegram_message_id: int,
        user_id: int,
        db,
        start: Optional[int] = None,
        limit: Optional[int] = None,
        mime_type: Optional[str] = None,
        file_size: Optional[int] = None,
    ):
        client = await telegram_client_manager.get_client(user_id, db)

        media, cached_file_size, cached_mime_type = await self._get_cached_message_media(
            user_id=user_id,
            chat_id=chat_id,
            telegram_message_id=telegram_message_id,
            client=client,
            force_refresh=False,
        )

        if file_size is None:
            file_size = cached_file_size
        if mime_type is None:
            mime_type = cached_mime_type

        offset = start if start is not None else 0
        total_to_download = limit if limit is not None else None

        optimal_chunk_size = StreamManager.get_optimal_chunk_size(file_size or 0, mime_type)

        # Telegram/Telethon practical max for download request part is 512KB.
        telegram_request_size = 512 * 1024

        bytes_sent = 0
        logger.info(
            f"Streaming | offset={offset} | limit={total_to_download} | "
            f"chunk_size={optimal_chunk_size // 1024}KB | request_size={telegram_request_size // 1024}KB | "
            f"file_size={(file_size or 0) / 1_000_000:.1f}MB | mime_type={mime_type}"
        )

        for attempt in range(2):
            try:
                async for chunk in client.iter_download(
                    media,
                    offset=offset,
                    chunk_size=optimal_chunk_size,
                    request_size=telegram_request_size,
                    file_size=file_size,
                ):
                    if total_to_download is not None:
                        remaining = total_to_download - bytes_sent
                        if remaining <= 0:
                            break
                        if len(chunk) > remaining:
                            chunk = chunk[:remaining]

                    bytes_sent += len(chunk)
                    yield chunk

                    if total_to_download is not None and bytes_sent >= total_to_download:
                        break

                break
            except Exception as e:
                is_file_ref_issue = "FILE_REFERENCE" in str(e).upper()
                if attempt == 0 and is_file_ref_issue:
                    logger.warning("Telegram file reference expired, refreshing cached media")
                    media, refreshed_size, refreshed_mime = await self._get_cached_message_media(
                        user_id=user_id,
                        chat_id=chat_id,
                        telegram_message_id=telegram_message_id,
                        client=client,
                        force_refresh=True,
                    )
                    if file_size is None:
                        file_size = refreshed_size
                    if mime_type is None:
                        mime_type = refreshed_mime
                    continue

                logger.error(f"Error streaming message {telegram_message_id}: {e}")
                raise

        logger.info(f"Streamed {bytes_sent / 1_000_000:.2f}MB total")


stream_manager = StreamManager()
