from minio import Minio
from minio.deleteobjects import DeleteObject
from minio.error import S3Error
import asyncio

from app.logger import logger
from app.config import settings


class MinioStorage:
    def __init__(self):
        self.client = Minio(
            settings.minio_endpoint,
            settings.minio_access_key,
            settings.minio_secret_key,
            secure=False
        )
        self.bucket = settings.minio_bucket

    @staticmethod
    def _chunk_key(upload_id: str, chunk_index: int) -> str:
        return f"{upload_id}/chunk_{chunk_index}"

    async def save_chunk(self, upload_id: str, chunk_index: int, file_obj, size: int):
        """
        Upload a chunk to MinIO and ensure completion before returning.
        """
        key = self._chunk_key(upload_id, chunk_index)
        loop = asyncio.get_running_loop()

        await loop.run_in_executor(
            None,
            lambda: self.client.put_object(
                self.bucket,
                key,
                file_obj,
                length=size
            )
        )

        logger.info(f"✅ Chunk uploaded: {key}")

    async def chunk_exists(self, upload_id: str, chunk_index: int) -> bool:
        """
        Check if a chunk exists in MinIO.
        Only treats real errors as errors.
        """
        key = self._chunk_key(upload_id, chunk_index)
        loop = asyncio.get_running_loop()

        try:
            await loop.run_in_executor(
                None,
                lambda: self.client.stat_object(self.bucket, key)
            )
            return True

        except S3Error as e:
            if e.code == "NoSuchKey":
                return False  # Expected case, not an error

            logger.error(f"❌ Unexpected S3 error for {key}: {e}")
            raise

    async def wait_for_chunk(self, upload_id: str, chunk_index: int, retries=10, delay=0.2):
        """
        Wait until a specific chunk becomes available.
        """
        for attempt in range(retries):
            if await self.chunk_exists(upload_id, chunk_index):
                return True

            await asyncio.sleep(delay)

        raise Exception(f"Chunk {chunk_index} not found after retries")

    async def wait_for_all_chunks(self, upload_id: str, total_chunks: int):
        """
        Ensure all chunks exist before proceeding (prevents race conditions).
        """
        for i in range(total_chunks):
            await self.wait_for_chunk(upload_id, i)

        logger.info(f"✅ All {total_chunks} chunks are available for upload_id={upload_id}")



    async def get_chunk_stream(self, upload_id, chunk_index):
        key = self._chunk_key(upload_id, chunk_index)

        loop = asyncio.get_running_loop()

        response = await loop.run_in_executor(
            None,
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

            delete_objects = (DeleteObject(obj.object_name) for obj in objects)

            errors = self.client.remove_objects(
                self.bucket,
                delete_objects
            )


            for err in errors:
                logger.error(f"Delete failed: {err}")

        await loop.run_in_executor(None, _delete)