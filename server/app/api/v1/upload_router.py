import hashlib

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from io import BytesIO
from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.schemas.folder import FileMetadata
from app.services.telegram.telegram_upload_service import upload_service
from app.logger import logger


router = APIRouter()


@router.post("/fast")
async def upload_ultra_fast_method(
        file_metadata: FileMetadata = Depends(FileMetadata.as_form),
        file: UploadFile = File(...),
        user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:

        buffer = BytesIO()
        hasher = hashlib.sha256()
        file_size = 0

        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)
            hasher.update(chunk)
            file_size += len(chunk)

        buffer.seek(0)
        await file.seek(0)

        file_hash = hasher.hexdigest()

        result = await upload_service.upload_file(
            file_metadata=file_metadata,
            file=buffer,
            raw_file=file,
            file_hash=file_hash,
            user_id=user.get("id") ,
            db=db)

        return result

    except Exception as e:
        logger.error(f"❌ Ultra-fast upload error: {e}", exc_info=True)
        raise e

