import asyncio
import re
from typing import Optional, AsyncGenerator
from fastapi.responses import StreamingResponse
from telethon.tl.functions.upload import GetFileRequest
from telethon.tl.types import InputDocumentFileLocation

from app.config import settings
from app.logger import logger
from app.services.telegram.storage_service import tele_storage_service


class FileStreamManager:

    @staticmethod
    def get_optimal_params(file_size: int, mime_type: str = None) -> dict:

        is_video = mime_type and mime_type.startswith('video/') if mime_type else False

        if file_size < 5_000_000:  # < 5MB
            return {"chunk_size": 2 * 1024 * 1024, "concurrent": 4}
        elif file_size < 20_000_000:  # < 20MB
            return {"chunk_size": 4 * 1024 * 1024, "concurrent": 6}
        elif file_size < 50_000_000:  # < 50MB
            return {"chunk_size": 6 * 1024 * 1024 if is_video else 4 * 1024 * 1024, "concurrent": 8}
        elif file_size < 100_000_000:  # < 100MB
            return {"chunk_size": 8 * 1024 * 1024 if is_video else 5 * 1024 * 1024, "concurrent": 10}
        else:  # > 100MB
            return {"chunk_size": 10 * 1024 * 1024, "concurrent": 12}

    @staticmethod
    async def download_chunk(client, location, offset: int, file_size: int):

        limit = settings.download_chunk_size  # MUST be 1MB

        aligned_offset = (offset // limit) * limit

        if aligned_offset >= file_size:
            return aligned_offset, b''

        result = await client(GetFileRequest(
            location=location,
            offset=aligned_offset,
            limit=limit
        ))

        return aligned_offset, result.bytes

    @staticmethod
    async def stream_parallel(
            client,
            message,
            start_offset: int,
            total_bytes: int,
            chunk_size: int,
            max_concurrent: int
    ) -> AsyncGenerator[bytes, None]:

        document = message.document

        location = InputDocumentFileLocation(
            id=document.id,
            access_hash=document.access_hash,
            file_reference=document.file_reference,
            thumb_size=''
        )

        file_size = document.size

        if total_bytes <= 0:
            return

        # Calculate chunks to download
        end_offset = min(start_offset + total_bytes, file_size)
        piece_size = settings.download_chunk_size
        aligned_start = (start_offset // piece_size) * piece_size
        offsets_to_fetch = list(range(aligned_start, end_offset, piece_size))
        total_chunks = len(offsets_to_fetch)
        bytes_sent = 0

        # Semaphore for concurrency control
        semaphore = asyncio.Semaphore(max_concurrent)

        async def download_with_semaphore(offset: int):
            async with semaphore:
                return await FileStreamManager.download_chunk(
                    client, location, offset, file_size
                )

        # Download and yield in batches
        batch_size = max_concurrent * 2

        for batch_start in range(0, total_chunks, batch_size):
            batch_end = min(batch_start + batch_size, total_chunks)

            # Calculate offsets for this batch
            offsets = offsets_to_fetch[batch_start:batch_end]

            # Download batch in parallel
            tasks = [download_with_semaphore(offset) for offset in offsets]
            results = await asyncio.gather(*tasks)

            # Sort by offset and yield
            results.sort(key=lambda x: x[0])

            for offset, data in results:
                if not data or bytes_sent >= total_bytes:
                    continue

                # Telegram requests are 1MB-aligned; trim to the exact requested byte window.
                data_start = offset
                data_end = offset + len(data)
                send_start = max(data_start, start_offset)
                send_end = min(data_end, end_offset)

                if send_start >= send_end:
                    continue

                local_start = send_start - data_start
                local_end = send_end - data_start
                chunk = data[local_start:local_end]

                remaining = total_bytes - bytes_sent
                if len(chunk) > remaining:
                    chunk = chunk[:remaining]

                if chunk:
                    bytes_sent += len(chunk)
                    yield chunk

    @staticmethod
    async def stream_standard(
            client,
            message,
            start_offset: int,
            total_bytes: int,
            chunk_size: int
    ) -> AsyncGenerator[bytes, None]:

        bytes_sent = 0

        async for chunk in client.iter_download(
                message,
                offset=start_offset,
                chunk_size=chunk_size,
                request_size=settings.download_chunk_size
        ):
            # Handle byte limit
            if total_bytes - bytes_sent < len(chunk):
                chunk = chunk[:total_bytes - bytes_sent]

            bytes_sent += len(chunk)
            yield chunk

            if bytes_sent >= total_bytes:
                break

    @staticmethod
    async def stream_file(
            file_id: int,
            user_id: int,
            db,
            range_header: Optional[str] = None
    ):

        # Get message
        client, file, message = await tele_storage_service.get_telegram_message(
            file_id, user_id, db
        )

        file_size = message.file.size
        mime_type = message.file.mime_type
        file_name = getattr(message.file, 'name', f'file_{file_id}')

        # Parse range header
        if range_header:
            match = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if match:
                start = int(match.group(1))
                end = int(match.group(2)) if match.group(2) else file_size - 1
                end = min(end, file_size - 1)
                start = max(0, start)

                if start >= file_size or start > end:
                    start, end = 0, file_size - 1
                    status_code = 200
                else:
                    status_code = 206

                content_length = end - start + 1
            else:
                start, end = 0, file_size - 1
                content_length = file_size
                status_code = 200
        else:
            start, end = 0, file_size - 1
            content_length = file_size
            status_code = 200

        # Get optimal parameters
        params = FileStreamManager.get_optimal_params(file_size, mime_type)
        chunk_size = params["chunk_size"]
        concurrent = params["concurrent"]


        logger.info(
            f" Streaming || size={file_size / 1_000_000:.1f}MB | "
            f"chunk={chunk_size // 1024}KB || "
            f"range={start}-{end}"
        )


        file_iterator = FileStreamManager.stream_parallel(
            client=client,
            message=message,
            start_offset=start,
            total_bytes=content_length,
            chunk_size=chunk_size,
            max_concurrent=concurrent
        )

        # Build headers
        headers = {
            "Content-Length": str(content_length),
            "Accept-Ranges": "bytes",
            "Content-Disposition": f'inline; filename="{file_name}"'
        }

        if range_header:
            headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"


        return StreamingResponse(
            file_iterator,
            media_type=mime_type,
            status_code=status_code,
            headers=headers
        )


file_stream_manager = FileStreamManager()
