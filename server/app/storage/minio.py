import math
from concurrent.futures import ThreadPoolExecutor
from minio import Minio
from minio.deleteobjects import DeleteObject
from minio.error import S3Error
import asyncio
import urllib3

from app.logger import logger
from app.config import settings

# ── Thread pool ──────────────────────────────────────────────────────────────
# All MinIO I/O runs here so it never blocks the asyncio event loop.
_POOL_SIZE = 32
_minio_executor = ThreadPoolExecutor(max_workers=_POOL_SIZE, thread_name_prefix="minio")

# ── HTTP connection pool ──────────────────────────────────────────────────────
# urllib3's default pool size is 10 — way too small for 32 concurrent threads.
# We create one shared PoolManager and hand it to every Minio instance.
_http_client = urllib3.PoolManager(
    maxsize=_POOL_SIZE,          # connections per host kept alive
    retries=urllib3.Retry(
        total=5,
        backoff_factor=0.2,
        status_forcelist=[500, 502, 503, 504],
    ),
    timeout=urllib3.Timeout(connect=5, read=60),
)


class MinioStorage:
    def __init__(self):
        self.client = Minio(
            settings.minio_endpoint,
            settings.minio_access_key,
            settings.minio_secret_key,
            secure=False,
            http_client=_http_client,   # shared pool — no more "pool is full" warnings
        )
        self.bucket = settings.minio_bucket

    @staticmethod
    def _chunk_key(upload_id: str, chunk_index: int) -> str:
        return f"{upload_id}/chunk_{chunk_index}"

    async def save_chunk(self, upload_id: str, chunk_index: int, file_obj, size: int):
        """Upload a chunk to MinIO using the dedicated thread pool."""
        key = self._chunk_key(upload_id, chunk_index)
        loop = asyncio.get_running_loop()

        await loop.run_in_executor(
            _minio_executor,
            lambda: self.client.put_object(
                self.bucket,
                key,
                file_obj,
                length=size,
            )
        )

    async def chunk_exists(self, upload_id: str, chunk_index: int) -> bool:
        """
        Check if a chunk exists in MinIO.
        """
        key = self._chunk_key(upload_id, chunk_index)
        loop = asyncio.get_running_loop()

        try:
            await loop.run_in_executor(
                _minio_executor,
                lambda: self.client.stat_object(self.bucket, key)
            )
            return True

        except S3Error as e:
            if e.code == "NoSuchKey":
                return False
            logger.error(f"❌ Unexpected S3 error for {key}: {e}")
            raise

    async def chunks_exist_batch(self, upload_id: str, indices: list[int]) -> list[bool]:
        """
        Check multiple chunk indices concurrently.  Returns a bool list in the
        same order as *indices*.
        """
        results = await asyncio.gather(
            *[self.chunk_exists(upload_id, i) for i in indices],
            return_exceptions=True,
        )
        return [r if isinstance(r, bool) else False for r in results]

    async def wait_for_chunk(self, upload_id: str, chunk_index: int, retries: int = 10, delay: float = 0.15):
        """
        Wait until a specific chunk becomes available.
        """
        for attempt in range(retries):
            if await self.chunk_exists(upload_id, chunk_index):
                return True
            await asyncio.sleep(delay)

        raise Exception(f"Chunk {chunk_index} not found after {retries} retries")

    async def wait_for_all_chunks(self, upload_id: str, total_chunks: int, concurrency: int = 16):
        """
        Verify all chunks are present using parallel stat calls.
        """
        semaphore = asyncio.Semaphore(concurrency)

        async def _check(i: int):
            async with semaphore:
                await self.wait_for_chunk(upload_id, i)

        await asyncio.gather(*[_check(i) for i in range(total_chunks)])
        logger.info(f"✅ All {total_chunks} chunks verified for upload_id={upload_id}")

    async def get_chunk_bytes(self, upload_id: str, chunk_index: int) -> bytes:
        """
        Download a full chunk and return its bytes.  Releases the HTTP
        connection immediately so the MinIO client stays healthy.
        """
        key = self._chunk_key(upload_id, chunk_index)
        loop = asyncio.get_running_loop()

        def _read():
            resp = self.client.get_object(self.bucket, key)
            try:
                return resp.read()
            finally:
                resp.close()
                resp.release_conn()

        return await loop.run_in_executor(_minio_executor, _read)

    async def get_chunk_stream(self, upload_id, chunk_index):
        key = self._chunk_key(upload_id, chunk_index)
        loop = asyncio.get_running_loop()
        response = await loop.run_in_executor(
            _minio_executor,
            lambda: self.client.get_object(self.bucket, key)
        )
        return response

    async def delete_upload(self, upload_id: str):
        prefix = f"{upload_id}/"
        loop = asyncio.get_running_loop()

        def _delete():
            objects = self.client.list_objects(
                self.bucket,
                prefix=prefix,
                recursive=True
            )
            delete_objects = [DeleteObject(obj.object_name) for obj in objects]
            if not delete_objects:
                return
            errors = self.client.remove_objects(self.bucket, iter(delete_objects))
            for err in errors:
                logger.error(f"Delete failed: {err}")

        await loop.run_in_executor(_minio_executor, _delete)
