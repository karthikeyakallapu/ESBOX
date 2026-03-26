import asyncio
import hashlib
import json
import math

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from io import BytesIO

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rate_limit import rate_limiter
from app.schemas.folder import FileMetadata
from app.schemas.upload import (
    UploadInitRequest,
    UploadInitResponse,
    ChunkUploadResponse,
    UploadCompleteRequest,
    UploadCompleteResponse,
    UploadStatusResponse,
)
from app.services.telegram.telegram_upload_service import upload_service
from app.services.telegram.file_manager import FileManager, file_manager
from app.services.upload.upload_state import upload_state, UploadStatus
from app.repositories.telegram.storage import storage_repository
from app.logger import logger
from app.storage import storage

router = APIRouter()


# ─── 1. POST /upload/fast  (small-file shortcut, unchanged) ─────

@router.post(
    "/fast",
    dependencies=[Depends(rate_limiter(20, 600))],
)
async def upload_ultra_fast_method(
        file_metadata: FileMetadata = Depends(FileMetadata.as_form),
        file: UploadFile = File(...),
        user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        # ── Validate file before reading ─────────────────────────
        await file_manager.is_valid_file(file)

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
            user_id=user.get("id"),
            db=db,
        )
        return result

    except Exception as e:
        logger.error(f"❌ Ultra-fast upload error: {e}", exc_info=True)
        raise e


# ─── 2. POST /upload/init ───────────────────────────────────────

@router.post(
    "/init",
    response_model=UploadInitResponse,
    dependencies=[Depends(rate_limiter(30, 60))],
)
async def upload_init(
    body: UploadInitRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        # ── Validate metadata before creating the upload session ─
        FileManager.validate_upload_metadata(
            file_name=body.file_name,
            file_size=body.file_size,
            mime_type=body.mime_type,
        )

        # ── Check if file already exists in the target folder ────
        existing = await storage_repository.is_file_exists(
            body.parent_id, user.get("id"), db, body.content_hash
        )
        if existing:
            raise HTTPException(
                status_code=409,
                detail="File already exists in the current folder",
            )

        # ── Compute chunk size and total chunks server-side ───────
        # Use 10 MB chunks for files ≤ 100 MB, 50 MB for everything larger,
        # capped to never exceed Telegram's 512 KB part-upload limit in practice.
        MB = 1024 * 1024
        if body.file_size <= 100 * MB:
            chunk_size = 10 * MB          # 10 MB
        elif body.file_size <= 500 * MB:
            chunk_size = 25 * MB          # 25 MB
        else:
            chunk_size = 50 * MB          # 50 MB

        total_chunks = math.ceil(body.file_size / chunk_size)

        upload_id = upload_state.init_upload(
            user_id=user.get("id"),
            file_name=body.file_name,
            file_size=body.file_size,
            mime_type=body.mime_type,
            total_chunks=total_chunks,
            chunk_size=chunk_size,
            content_hash=body.content_hash,
            parent_id=body.parent_id,
        )

        return UploadInitResponse(
            upload_id=upload_id,
            chunk_size=chunk_size,
            total_chunks=total_chunks,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Upload init error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to initialise upload")


# ─── 3. POST /upload/chunk ──────────────────────────────────────

@router.post(
    "/chunk",
    response_model=ChunkUploadResponse,
    dependencies=[Depends(rate_limiter(600, 60))],
)
async def upload_chunk(
    upload_id: str = Form(...),
    chunk_index: int = Form(...),
    chunk_size: int = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    try:
        # Validate upload session exists and belongs to this user
        meta = upload_state.get_meta(upload_id)
        if not meta:
            raise HTTPException(status_code=404, detail="Upload session not found or expired")
        if meta["user_id"] != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorised for this upload")

        # Validate chunk index bounds
        if chunk_index < 0 or chunk_index >= meta["total_chunks"]:
            raise HTTPException(status_code=400, detail=f"Invalid chunk index {chunk_index}")

        # Idempotent: skip if already stored
        if await storage.chunk_exists(upload_id, chunk_index):
            received = upload_state.get_status(upload_id) or {}
            return ChunkUploadResponse(
                status="already_uploaded",
                chunk_index=chunk_index,
                progress=received.get("progress", 0),
            )

        # Stream chunk into MinIO
        await storage.save_chunk(upload_id, chunk_index, file.file, chunk_size)

        # Track in Redis
        received_count = upload_state.record_chunk(upload_id, chunk_index)
        progress = round((received_count / meta["total_chunks"]) * 100, 1)

        return ChunkUploadResponse(
            status="uploaded",
            chunk_index=chunk_index,
            progress=progress,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Chunk upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


# ─── 4. POST /upload/complete ───────────────────────────────────

@router.post(
    "/complete",
    response_model=UploadCompleteResponse,
    dependencies=[Depends(rate_limiter(30, 60))],
)
async def upload_complete(
    body: UploadCompleteRequest,
    user=Depends(get_current_user),
):
    upload_id = body.upload_id

    try:
        # Validate session
        meta = upload_state.get_meta(upload_id)
        if not meta:
            raise HTTPException(status_code=404, detail="Upload session not found or expired")
        if meta["user_id"] != user.get("id"):
            raise HTTPException(status_code=403, detail="Not authorised for this upload")

        # Prevent duplicate complete calls
        if not upload_state.acquire_complete_lock(upload_id):
            return UploadCompleteResponse(
                status="already_processing",
                upload_id=upload_id,
                message="Upload is already being processed",
            )

        # Validate all chunks are in MinIO
        total = meta["total_chunks"]
        missing = []
        for i in range(total):
            if not await storage.chunk_exists(upload_id, i):
                missing.append(i)

        if missing:
            upload_state.set_failed(upload_id, f"Missing chunks: {missing[:10]}")
            raise HTTPException(
                status_code=400,
                detail=f"Missing {len(missing)} chunk(s): {missing[:10]}"
            )

        # Mark processing & launch background job
        upload_state.set_processing(upload_id)

        asyncio.create_task(
            upload_service.process_chunked_upload(upload_id, meta, user.get("id"))
        )

        return UploadCompleteResponse(
            status="processing",
            upload_id=upload_id,
            message="Upload is being processed",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Upload complete error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


# ─── 5. GET /upload/status ──────────────────────────────────────

@router.get(
    "/status",
    response_model=UploadStatusResponse,
    dependencies=[Depends(rate_limiter(120, 60))],
)
async def get_upload_status(
    upload_id: str,
    user=Depends(get_current_user),
):
    meta = upload_state.get_meta(upload_id)
    status = upload_state.get_status(upload_id)

    if not status:
        raise HTTPException(status_code=404, detail="Upload not found")

    # Ownership check — meta may already be cleaned up after completion
    if meta and meta["user_id"] != user.get("id"):
        raise HTTPException(status_code=403, detail="Not authorised")

    return UploadStatusResponse(
        upload_id=upload_id,
        status=status.get("status", "unknown"),
        progress=status.get("progress", 0),
        message=status.get("message", ""),
        file=status.get("file"),
    )


# ─── 6. GET /upload/progress/{upload_id}  (SSE) ─────────────────

@router.get("/progress/{upload_id}")
async def upload_progress_sse(
    upload_id: str,
    request: Request,
    user=Depends(get_current_user),
):
    """
    Server-Sent Events stream for real-time upload progress.
    The client connects once and receives events until the upload
    completes, fails, or the connection is dropped.

    Event format:
        data: {"status": "...", "progress": 0-100, "message": "...", "file": {...}|null}
    """
    # Ownership check up-front
    meta = upload_state.get_meta(upload_id)
    status_now = upload_state.get_status(upload_id)

    if not status_now:
        raise HTTPException(status_code=404, detail="Upload not found")
    if meta and meta["user_id"] != user.get("id"):
        raise HTTPException(status_code=403, detail="Not authorised")

    TERMINAL = {UploadStatus.COMPLETED, UploadStatus.FAILED}

    async def event_generator():
        last_payload = None
        poll_interval = 0.5  # seconds between Redis polls

        while True:
            if await request.is_disconnected():
                break

            current = upload_state.get_status(upload_id)
            if not current:
                # Session expired
                yield f"data: {json.dumps({'status': 'expired', 'progress': 0, 'message': 'Upload session expired'})}\n\n"
                break

            payload = {
                "status": current.get("status", "unknown"),
                "progress": current.get("progress", 0),
                "message": current.get("message", ""),
                "file": current.get("file"),
            }

            # Only push when something actually changed
            if payload != last_payload:
                yield f"data: {json.dumps(payload)}\n\n"
                last_payload = payload

            if payload["status"] in TERMINAL:
                break

            await asyncio.sleep(poll_interval)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disable nginx buffering
            "Connection": "keep-alive",
        },
    )


