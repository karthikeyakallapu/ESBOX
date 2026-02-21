import re

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from starlette.status import HTTP_416_RANGE_NOT_SATISFIABLE

from app.logger import logger
from app.repositories.file import file_repository
from app.services.telegram.stream_manager import stream_manager


class FileStreamManager:



    async def stream_file(
            self,
            file_id: int,
            user_id: int,
            db
    ) -> StreamingResponse:
        """Full file stream (no range)"""


        file = await file_repository.get_file_by_id(file_id, user_id, db)

        if not file:
            raise HTTPException(status_code=404, detail="File not found")

        async def generate():
            async for chunk in stream_manager.stream_file(
                    file.telegram_chat_id,
                    file.telegram_message_id,
                    user_id,
                    db,
                    mime_type=file.mime_type,
                    file_size=file.file_size
            ):
                yield chunk

        return StreamingResponse(
            generate(),
            media_type=file.mime_type,
            headers={
                'Content-Length': str(file.file_size),
                'Accept-Ranges': 'bytes',
                'Content-Disposition': f'inline; filename="{file.filename}"',
                'Cache-Control': 'public, max-age=3600'
            }
        )

    async def partial_stream_file(
            self,
            file_id: int,
            range_header: str,
            user_id: int,
            db
    ):
        """
        Enhanced version with optimizations

        Key improvements:
        1. Adaptive chunk sizes passed to stream_manager
        2. Better prefetch for large files
        3. File type awareness
        """


        try:
            file = await file_repository.get_file_by_id(file_id, user_id, db)

            if not file:
                raise HTTPException(status_code=404, detail="File not found")

            if not range_header:
                return await self.stream_file(file_id, user_id, db)

            # Parse range
            match = re.match(r"bytes=(\d*)-(\d*)", range_header)
            if not match:
                raise HTTPException(
                    status_code=HTTP_416_RANGE_NOT_SATISFIABLE,
                    detail="Invalid Range header format"
                )

            start_str, end_str = match.groups()

            # Adaptive max range window based on file type
            is_video = file.mime_type.startswith('video/')

            if is_video:
                # Bigger windows reduce repeated range round-trips from the player.
                MAX_RANGE_WINDOW = 16 * 1024 * 1024  # 16MB for videos
            else:
                # Larger window for documents (faster download)
                MAX_RANGE_WINDOW = 32 * 1024 * 1024  # 32MB for docs

            start = int(start_str) if start_str else 0

            if end_str:
                end = int(end_str)
            else:
                end = min(start + MAX_RANGE_WINDOW - 1, file.file_size - 1)

            if start >= file.file_size or end >= file.file_size or start > end:
                raise HTTPException(
                    status_code=HTTP_416_RANGE_NOT_SATISFIABLE,
                    detail="Range not satisfiable"
                )

            requested_length = end - start + 1

            # Adaptive prefetch based on file type
            if is_video:
                PREFETCH_SIZE = 8 * 1024 * 1024  # 8MB for videos
            else:
                PREFETCH_SIZE = 16 * 1024 * 1024  # 16MB for documents

            effective_download_size = min(
                file.file_size - start,
                requested_length + PREFETCH_SIZE
            )

            logger.info(
                f"📤 Range request | "
                f"file={file.filename} | "
                f"type={file.mime_type} | "
                f"range={start}-{end} | "
                f"requested={requested_length / 1024:.0f}KB | "
                f"prefetch={effective_download_size / 1024:.0f}KB"
            )

            # Stream from Telegram with optimizations
            async def generate_range():
                try:
                    bytes_sent = 0

                    async for chunk in stream_manager.stream_file(
                            file.telegram_chat_id,
                            file.telegram_message_id,
                            user_id,
                            db,
                            start,
                            effective_download_size,
                            mime_type=file.mime_type,
                            file_size=file.file_size
                    ):
                        if bytes_sent >= requested_length:
                            break

                        remaining = requested_length - bytes_sent

                        if len(chunk) > remaining:
                            chunk = chunk[:remaining]

                        bytes_sent += len(chunk)
                        yield chunk

                    logger.info(
                        f"✓ Streamed {bytes_sent / 1024:.0f}KB "
                        f"(range {start}-{end})"
                    )

                except Exception as e:
                    logger.error(
                        f"❌ Streaming error for file {file_id}: {e}"
                    )
                    raise

            return StreamingResponse(
                generate_range(),
                media_type=file.mime_type,
                status_code=206,
                headers={
                    "Content-Range": f"bytes {start}-{end}/{file.file_size}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(requested_length),
                    "Content-Disposition": f'inline; filename="{file.filename}"',
                    "Cache-Control": "public, max-age=3600"
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            raise


file_stream_manager = FileStreamManager()
