import asyncio
import re
from typing import Optional, AsyncGenerator

from fastapi.responses import StreamingResponse
from fastapi import Request

from telethon.tl.functions.upload import GetFileRequest
from telethon.tl.types import InputDocumentFileLocation

from app.config import settings
from app.logger import logger
from app.services.telegram.storage_service import tele_storage_service


class FileStreamManager:

    @staticmethod
    def get_optimal_params(file_size: int, mime_type: str | None):

        is_video = mime_type.startswith("video/") if mime_type else False

        if file_size < 5_000_000:
            return {"concurrent": 4}

        elif file_size < 20_000_000:
            return {"concurrent": 6}

        elif file_size < 50_000_000:
            return {"concurrent": 8 if not is_video else 10}

        elif file_size < 100_000_000:
            return {"concurrent": 10}

        else:
            return {"concurrent": 12}

    @staticmethod
    def get_request_size(file_size: int):

        if file_size < 20_000_000:
            return 256 * 1024

        elif file_size < 100_000_000:
            return 512 * 1024

        return 1024 * 1024

    # -----------------------------------------------------

    @staticmethod
    async def download_chunk(client, location, offset: int, file_size: int, request_size: int):

        aligned_offset = (offset // request_size) * request_size

        if aligned_offset >= file_size:
            return aligned_offset, b""

        result = await client(
            GetFileRequest(
                location=location,
                offset=aligned_offset,
                limit=request_size
            )
        )

        return aligned_offset, result.bytes

    # -----------------------------------------------------

    @staticmethod
    async def stream_parallel(
        client,
        message,
        request: Request,
        start_offset: int,
        total_bytes: int,
        max_concurrent: int
    ) -> AsyncGenerator[bytes, None]:

        document = message.document

        location = InputDocumentFileLocation(
            id=document.id,
            access_hash=document.access_hash,
            file_reference=document.file_reference,
            thumb_size=""
        )

        file_size = document.size

        if total_bytes <= 0:
            return

        request_size = FileStreamManager.get_request_size(file_size)

        end_offset = min(start_offset + total_bytes, file_size)
        aligned_start = (start_offset // request_size) * request_size

        offsets = [
            offset for offset in range(aligned_start, end_offset, request_size)
            if offset < file_size
        ]

        semaphore = asyncio.Semaphore(max_concurrent)

        async def fetch(offset):
            async with semaphore:
                return await FileStreamManager.download_chunk(
                    client,
                    location,
                    offset,
                    file_size,
                    request_size
                )

        batch_size = max_concurrent * 3

        bytes_sent = 0
        total_chunks = len(offsets)

        for batch_start in range(0, total_chunks, batch_size):

            if await request.is_disconnected():
                logger.info("Client disconnected, stopping stream")
                return

            batch_offsets = offsets[batch_start:batch_start + batch_size]

            tasks = [fetch(offset) for offset in batch_offsets]

            results = []

            for coro in asyncio.as_completed(tasks):
                try:
                    result = await coro
                    results.append(result)
                except asyncio.CancelledError:
                    logger.info("Streaming cancelled")
                    return

            results.sort(key=lambda x: x[0])

            for offset, data in results:

                if await request.is_disconnected():
                    logger.info("Client disconnected during stream")
                    return

                if not data or bytes_sent >= total_bytes:
                    continue

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

                    try:
                        yield chunk
                    except asyncio.CancelledError:
                        logger.info("Streaming cancelled while sending chunk")
                        return

                if bytes_sent >= total_bytes:
                    return

    # -----------------------------------------------------

    @staticmethod
    async def stream_file(
        file_id: int,
        user_id: int | None,
        db,
        request: Request,
        range_header: Optional[str] = None,
        disposition: str = "inline"
    ):

        client, file, message = await tele_storage_service.get_telegram_message(
            file_id,
            user_id,
            db
        )

        file_size = message.file.size
        mime_type = message.file.mime_type
        file_name = getattr(message.file, "name", f"file_{file_id}")

        if range_header:

            match = re.match(r"bytes=(\d+)-(\d*)", range_header)

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

        params = FileStreamManager.get_optimal_params(file_size, mime_type)

        logger.info(
            f"Streaming | "
            f"size={file_size / 1_000_000:.1f}MB | "
            f"concurrency={params['concurrent']} | "
            f"range={start}-{end}"
        )

        file_iterator = FileStreamManager.stream_parallel(
            client=client,
            message=message,
            request=request,
            start_offset=start,
            total_bytes=content_length,
            max_concurrent=params["concurrent"]
        )

        headers = {
            "Content-Length": str(content_length),
            "Accept-Ranges": "bytes",
            "Content-Disposition": f'{disposition}; filename="{file_name}"',
            "Cache-Control": "private, max-age=3600"
        }

        if status_code == 206:
            headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"

        return StreamingResponse(
            file_iterator,
            media_type=mime_type,
            status_code=status_code,
            headers=headers
        )


file_stream_manager = FileStreamManager()