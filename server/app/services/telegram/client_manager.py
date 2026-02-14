import asyncio
from collections import OrderedDict
from typing import Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from telethon import TelegramClient
from telethon.sessions import StringSession

from app.config import settings
from app.helpers.encryption import encryption
from app.logger import logger
from app.models import TelegramSession
from app.services.redis.RedisService import redis_service


# Custom exceptions
class TelegramSessionError(Exception):
    """Base exception for Telegram session errors"""
    pass


class TelegramUnauthorizedError(TelegramSessionError):
    """Raised when a Telegram session is not authorized"""
    pass


class TelegramSessionNotFoundError(TelegramSessionError):
    """Raised when a Telegram session is not found"""
    pass


class TelegramClientManager:
    MAX_CLIENTS = 100  # LRU limit per worker

    def __init__(self):
        # user_id -> TelegramClient (LRU ordered)
        self._local_cache: OrderedDict[int, TelegramClient] = OrderedDict()

        # user_id -> asyncio.Lock
        self._user_locks: Dict[int, asyncio.Lock] = {}

    # ------------------ helpers ------------------

    @staticmethod
    def _get_redis_key(user_id: int) -> str:
        return f"telegram_auth_{user_id}"

    def _get_user_lock(self, user_id: int) -> asyncio.Lock:
        if user_id not in self._user_locks:
            self._user_locks[user_id] = asyncio.Lock()
        return self._user_locks[user_id]

    # ------------------ eviction ------------------

    async def _evict_if_needed(self):
        while len(self._local_cache) > self.MAX_CLIENTS:
            evicted_user_id, client = self._local_cache.popitem(last=False)
            try:
                if client.is_connected():
                    await client.disconnect()
                logger.info(f"LRU-evicted Telegram client for user {evicted_user_id}")
            except Exception as e:
                logger.error(
                    f"Error disconnecting evicted client for user {evicted_user_id}: {e}"
                )

            # Cleanup lock
            self._user_locks.pop(evicted_user_id, None)

    # ------------------ invalidation ------------------

    async def _invalidate_client(self, user_id: int):
        try:
            redis_service.delete_key(self._get_redis_key(user_id))
        except Exception as e:
            logger.warning(f"Failed to delete Redis key for user {user_id}: {e}")

        client = self._local_cache.pop(user_id, None)
        if client:
            try:
                if client.is_connected():
                    await client.disconnect()
                logger.info(f"Invalidated Telegram client for user {user_id}")
            except Exception as e:
                logger.error(f"Error disconnecting client for user {user_id}: {e}")

        self._user_locks.pop(user_id, None)

    # ------------------ client creation ------------------

    async def create_client(self, user_id: int, session_string: str) -> TelegramClient:
        client = TelegramClient(
            StringSession(session_string),
            settings.telegram_api_id,
            settings.telegram_api_hash,
            connection_retries=3,
            retry_delay=1,
            auto_reconnect=True,
            timeout=10,
        )

        try:
            await client.connect()

            if not await client.is_user_authorized():
                await client.disconnect()
                redis_service.delete_key(self._get_redis_key(user_id))
                raise TelegramUnauthorizedError("Telegram session is not authorized")

            logger.info(f"Created Telegram client for user {user_id}")
            return client

        except Exception:
            try:
                await client.disconnect()
            except Exception:
                pass
            raise

    # ------------------ session resolution ------------------

    async def _get_session_string(self, user_id: int, db: AsyncSession) -> str | None:
        redis_data = redis_service.get_key(self._get_redis_key(user_id), as_json=True)
        if redis_data:
            return redis_data.get("session_string")

        logger.debug(f"Session for user {user_id} not in Redis, fetching from DB")
        return await self._fetch_session_from_db(user_id, db)

    async def _fetch_session_from_db(
            self, user_id: int, db: AsyncSession
    ) -> str | None:
        result = await db.execute(
            select(TelegramSession).where(TelegramSession.user_id == user_id)
        )

        record = result.scalars().one_or_none()
        if not record:
            return None

        session_string = None

        if record.encrypted_session:
            session_string = encryption.decrypt(record.encrypted_session)

        redis_service.set_key(
            self._get_redis_key(user_id),
            {"session_string": session_string},
            ttl=1800,
        )

        return session_string

    async def has_session(self, user_id: int, db: AsyncSession) -> bool:
        """Check if a user has a Telegram session without throwing an error"""
        try:
            session_string = await self._get_session_string(user_id, db)
            return session_string is not None
        except Exception as e:
            logger.debug(f"Error checking session for user {user_id}: {e}")
            return False

    # ------------------ public API ------------------

    async def get_client(self, user_id: int, db: AsyncSession) -> TelegramClient:
        # Fast path (update LRU)
        if user_id in self._local_cache:
            client = self._local_cache[user_id]
            # Health check: ensure client is still connected
            if not client.is_connected():
                logger.warning(f"Cached client for user {user_id} was disconnected, reconnecting...")
                try:
                    await client.connect()
                except Exception as e:
                    logger.error(f"Failed to reconnect cached client for user {user_id}: {e}")
                    # If reconnection fails, invalidate and create a new client
                    await self._invalidate_client(user_id)
                    return await self.get_client(user_id, db)

            self._local_cache.move_to_end(user_id)
            return client

        lock = self._get_user_lock(user_id)

        try:
            # Add timeout to prevent indefinite waiting
            async with asyncio.timeout(30):
                async with lock:
                    # Double check after acquiring lock
                    if user_id in self._local_cache:
                        client = self._local_cache[user_id]
                        # Health check again
                        if not client.is_connected():
                            logger.warning(f"Cached client for user {user_id} was disconnected, reconnecting...")
                            try:
                                await client.connect()
                            except Exception as e:
                                logger.error(f"Failed to reconnect cached client for user {user_id}: {e}")
                                await self._invalidate_client(user_id)
                                # Recursive call to create new client
                                return await self.get_client(user_id, db)

                        self._local_cache.move_to_end(user_id)
                        return client

                    session_string = await self._get_session_string(user_id, db)
                    if not session_string:
                        raise TelegramSessionNotFoundError(f"No Telegram session for user {user_id}")

                    client = await self.create_client(user_id, session_string)

                    self._local_cache[user_id] = client
                    await self._evict_if_needed()

                    return client
        except asyncio.TimeoutError:
            logger.error(f"Timeout acquiring lock for user {user_id}")
            raise TelegramSessionError(f"Timeout acquiring Telegram client for user {user_id}")

    async def refresh_session(self, user_id: int, db: AsyncSession) -> TelegramClient:
        await self._invalidate_client(user_id)
        return await self.get_client(user_id, db)

    async def clean_up_all_local_cache(self):
        for user_id in list(self._local_cache.keys()):
            await self._invalidate_client(user_id)


telegram_client_manager = TelegramClientManager()
