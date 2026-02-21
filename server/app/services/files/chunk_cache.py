"""
Simple in-memory cache for file chunks to reduce Telegram API calls
"""
import time
from typing import Optional, Dict, Tuple
import asyncio
from collections import OrderedDict

class ChunkCache:
    def __init__(self, max_size_mb: int = 500, ttl_seconds: int = 3600):
        """
        Initialize chunk cache

        Args:
            max_size_mb: Maximum cache size in megabytes
            ttl_seconds: Time to live for cached chunks in seconds
        """
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.ttl_seconds = ttl_seconds
        self.cache: OrderedDict[str, Tuple[bytes, float]] = OrderedDict()
        self.current_size = 0
        self._lock = asyncio.Lock()

    def _make_key(self, file_id: int, start: int, end: int) -> str:
        """Generate cache key from file_id and byte range"""
        return f"{file_id}:{start}:{end}"

    async def get(self, file_id: int, start: int, end: int) -> Optional[bytes]:
        """
        Get cached chunk if available and not expired

        Returns:
            Cached bytes or None if not found/expired
        """
        async with self._lock:
            key = self._make_key(file_id, start, end)

            if key in self.cache:
                data, timestamp = self.cache[key]

                # Check if expired
                if time.time() - timestamp > self.ttl_seconds:
                    # Remove expired entry
                    self.current_size -= len(data)
                    del self.cache[key]
                    return None

                # Move to end (mark as recently used)
                self.cache.move_to_end(key)
                return data

            return None

    async def set(self, file_id: int, start: int, end: int, data: bytes):
        """
        Store chunk in cache

        Args:
            file_id: File identifier
            start: Start byte position
            end: End byte position
            data: Chunk data to cache
        """
        async with self._lock:
            key = self._make_key(file_id, start, end)
            data_size = len(data)

            # Remove existing entry if present
            if key in self.cache:
                old_data, _ = self.cache[key]
                self.current_size -= len(old_data)
                del self.cache[key]

            # Evict old entries if needed to make room
            while self.current_size + data_size > self.max_size_bytes and self.cache:
                # Remove oldest entry (first item in OrderedDict)
                oldest_key, (oldest_data, _) = self.cache.popitem(last=False)
                self.current_size -= len(oldest_data)

            # Add new entry
            if data_size <= self.max_size_bytes:  # Only cache if fits in max size
                self.cache[key] = (data, time.time())
                self.current_size += data_size

    async def clear(self):
        """Clear all cached chunks"""
        async with self._lock:
            self.cache.clear()
            self.current_size = 0

    def get_stats(self) -> Dict[str, any]:
        """Get cache statistics"""
        return {
            "entries": len(self.cache),
            "size_mb": round(self.current_size / (1024 * 1024), 2),
            "max_size_mb": round(self.max_size_bytes / (1024 * 1024), 2),
            "utilization": round((self.current_size / self.max_size_bytes) * 100, 2) if self.max_size_bytes > 0 else 0
        }


# Global cache instance
chunk_cache = ChunkCache(max_size_mb=500, ttl_seconds=3600)
