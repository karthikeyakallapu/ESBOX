import hashlib
from io import BytesIO
from pathlib import Path

import filetype
from fastapi import File, HTTPException, UploadFile, status

from app.config import settings
from app.logger import logger

# None = allow all detected types
ALLOWED_MIME_TYPES = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
}


class FileManager:

    @staticmethod
    async def _get_real_file_type(file: UploadFile) -> tuple[str, str]:

        header = await file.read(261)
        await file.seek(0)

        kind = filetype.guess(header)
        if not kind:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to determine file type"
            )

        return kind.mime, f".{kind.extension}"

    async def is_valid_file(self, file: UploadFile = File(...)):

        if file.size and file.size > settings.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.max_file_size / (1024 ** 3):.1f}GB"
            )

        ext = Path(file.filename).suffix.lower()

        mime, real_ext = await self._get_real_file_type(file)

        if ALLOWED_MIME_TYPES is not None:
            if mime not in ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"Unsupported file type: {mime}"
                )

            if ext not in ALLOWED_MIME_TYPES[mime]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File extension does not match file content"
                )

        # Ensure filename has proper extension
        filename = file.filename if file.filename else f"unnamed{real_ext}"

        return {"name": filename, "size": file.size, "type": mime, "extension": real_ext}

    @staticmethod
    async def get_file_buffer(file):

        buffer = BytesIO()
        file_size = 0
        hasher = hashlib.sha256()

        # Stream file to memory while validating size and calculating hash
        try:
            while True:
                # Read chunk
                chunk = await file.read(settings.chunk_size)
                if not chunk:
                    break

                file_size += len(chunk)

                # Write to buffer and update hash
                buffer.write(chunk)
                hasher.update(chunk)

            # Reset buffer to beginning for reading
            buffer.seek(0)
        except Exception as e:
            logger.error(e)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to get file content: {e}"
            )

        return buffer, hasher.hexdigest()


file_manager = FileManager()
