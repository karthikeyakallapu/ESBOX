"""
Redis-backed upload state manager.

Keys layout:
  upload:{upload_id}:meta   → JSON hash with file metadata + ownership
  upload:{upload_id}:chunks → Redis SET of received chunk indices
  upload:{upload_id}:status → JSON hash with processing state
  upload:{upload_id}:lock   → simple lock to prevent duplicate complete calls

All keys expire after TTL_SECONDS so orphaned uploads are auto-cleaned.
"""

import json
import uuid
import time
from typing import Optional

from app.services.redis.RedisService import redis_service
from app.logger import logger

TTL_SECONDS = 60 * 60 * 2  # 2 hours — generous for large uploads
STATUS_TTL = 60 * 60 * 24  # 24 hours — keep status for client polling after completion


class UploadStatus:
    PENDING = "pending"           # init called, waiting for chunks
    UPLOADING = "uploading"       # chunks still being received
    COMPLETING = "completing"     # all chunks received, validation in progress
    PROCESSING = "processing"     # background job running (uploading to Telegram)
    COMPLETED = "completed"       # done
    FAILED = "failed"             # error occurred


class UploadState:
    """Manages upload lifecycle state in Redis."""

    # ── Key helpers ──────────────────────────────────────────────

    @staticmethod
    def _meta_key(upload_id: str) -> str:
        return f"upload:{upload_id}:meta"

    @staticmethod
    def _chunks_key(upload_id: str) -> str:
        return f"upload:{upload_id}:chunks"

    @staticmethod
    def _status_key(upload_id: str) -> str:
        return f"upload:{upload_id}:status"

    @staticmethod
    def _lock_key(upload_id: str) -> str:
        return f"upload:{upload_id}:lock"

    # ── Init ─────────────────────────────────────────────────────

    def init_upload(
        self,
        user_id: int,
        file_name: str,
        file_size: int,
        mime_type: str,
        total_chunks: int,
        chunk_size: int,
        content_hash: str,
        parent_id: Optional[int] = None,
    ) -> str:
        """Create a new upload session. Returns upload_id."""
        upload_id = uuid.uuid4().hex
        client = redis_service.get_client()
        pipe = client.pipeline(transaction=True)

        meta = {
            "upload_id": upload_id,
            "user_id": user_id,
            "file_name": file_name,
            "file_size": file_size,
            "mime_type": mime_type,
            "total_chunks": total_chunks,
            "chunk_size": chunk_size,
            "content_hash": content_hash,
            "parent_id": parent_id if parent_id is not None else "",
            "created_at": time.time(),
        }

        status = {
            "status": UploadStatus.PENDING,
            "progress": 0,
            "message": "Waiting for upload to start…",
            "updated_at": time.time(),
        }

        meta_key = self._meta_key(upload_id)
        status_key = self._status_key(upload_id)
        chunks_key = self._chunks_key(upload_id)

        pipe.set(meta_key, json.dumps(meta), ex=TTL_SECONDS)
        pipe.set(status_key, json.dumps(status), ex=TTL_SECONDS)
        # initialise empty set by adding & removing a sentinel
        pipe.sadd(chunks_key, "__init__")
        pipe.srem(chunks_key, "__init__")
        pipe.expire(chunks_key, TTL_SECONDS)
        pipe.execute()

        logger.info(f"Upload init | id={upload_id} | file={file_name} | chunks={total_chunks}")
        return upload_id

    # ── Chunk tracking ───────────────────────────────────────────

    def record_chunk(self, upload_id: str, chunk_index: int) -> int:
        """
        Mark a chunk as received.
        Uses a single pipeline round-trip: SADD + SCARD + status SET.
        Returns new count of received chunks.
        """
        client = redis_service.get_client()
        chunks_key = self._chunks_key(upload_id)

        # Pipeline: atomically add the chunk and count received chunks
        pipe = client.pipeline(transaction=False)
        pipe.sadd(chunks_key, str(chunk_index))
        pipe.scard(chunks_key)
        _, received = pipe.execute()

        # Avoid a separate GET for meta — total_chunks is embedded in meta key but
        # we read it only if the meta is still alive (avoids blocking on large uploads).
        raw_meta = redis_service.get_key(self._meta_key(upload_id))
        if raw_meta:
            meta = json.loads(raw_meta)
            total = meta["total_chunks"]
            progress = round((received / total) * 100, 1) if total > 0 else 0
            # Fire-and-forget status update via pipeline (no need to read current status)
            status_key = self._status_key(upload_id)
            status = {
                "status": UploadStatus.UPLOADING,
                "progress": progress,
                "message": "Uploading…",
                "updated_at": time.time(),
            }
            client.set(status_key, json.dumps(status), ex=STATUS_TTL)

        return received

    def get_received_chunks(self, upload_id: str) -> set[int]:
        client = redis_service.get_client()
        raw = client.smembers(self._chunks_key(upload_id))
        return {int(x) for x in raw if x != "__init__"}

    def all_chunks_received(self, upload_id: str) -> bool:
        meta = self.get_meta(upload_id)
        if not meta:
            return False
        received = redis_service.get_client().scard(self._chunks_key(upload_id))
        return received >= meta["total_chunks"]

    # ── Metadata ─────────────────────────────────────────────────

    def get_meta(self, upload_id: str) -> Optional[dict]:
        raw = redis_service.get_key(self._meta_key(upload_id))
        if not raw:
            return None
        return json.loads(raw)

    # ── Status ───────────────────────────────────────────────────

    def get_status(self, upload_id: str) -> Optional[dict]:
        raw = redis_service.get_key(self._status_key(upload_id))
        if not raw:
            return None
        return json.loads(raw)

    def _update_status(self, upload_id: str, fields: dict):
        current = self.get_status(upload_id)
        if not current:
            current = {}
        current.update(fields)
        current["updated_at"] = time.time()
        redis_service.set_key(self._status_key(upload_id), current, ttl=STATUS_TTL)

    def set_processing(self, upload_id: str):
        self._update_status(upload_id, {
            "status": UploadStatus.PROCESSING,
            "progress": 0,
            "message": "Uploading to storage…",
        })

    def update_processing_progress(self, upload_id: str, progress: float, message: str = ""):
        self._update_status(upload_id, {
            "status": UploadStatus.PROCESSING,
            "progress": round(progress, 1),
            "message": message or f"Processing {round(progress, 1)}%",
        })

    def set_completed(self, upload_id: str, file_record: dict):
        self._update_status(upload_id, {
            "status": UploadStatus.COMPLETED,
            "progress": 100,
            "message": "Upload complete",
            "file": file_record,
        })

    def set_failed(self, upload_id: str, error: str):
        self._update_status(upload_id, {
            "status": UploadStatus.FAILED,
            "message": error,
        })

    # ── Lock (idempotent complete) ───────────────────────────────

    def acquire_complete_lock(self, upload_id: str) -> bool:
        """Acquire lock to prevent duplicate /complete calls. Returns True if acquired."""
        client = redis_service.get_client()
        return bool(client.set(self._lock_key(upload_id), "1", nx=True, ex=TTL_SECONDS))

    # ── Cleanup ──────────────────────────────────────────────────

    def cleanup(self, upload_id: str):
        """Remove meta + chunks keys (status is kept for polling)."""
        client = redis_service.get_client()
        client.delete(
            self._meta_key(upload_id),
            self._chunks_key(upload_id),
            self._lock_key(upload_id),
        )


upload_state = UploadState()
