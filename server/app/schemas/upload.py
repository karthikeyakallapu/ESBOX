from typing import Optional
from pydantic import BaseModel, Field


# ── Request schemas ──────────────────────────────────────────────

class UploadInitRequest(BaseModel):
    file_name: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0)
    mime_type: str = Field(..., min_length=1, max_length=100)
    total_chunks: int = Field(..., gt=0)
    chunk_size: int = Field(..., gt=0)
    content_hash: str = Field(..., min_length=64, max_length=64, description="SHA-256 hex digest")
    parent_id: Optional[int] = None


class UploadCompleteRequest(BaseModel):
    upload_id: str = Field(..., min_length=1)


# ── Response schemas ─────────────────────────────────────────────

class UploadInitResponse(BaseModel):
    upload_id: str
    status: str = "pending"
    message: str = "Upload session created"


class ChunkUploadResponse(BaseModel):
    status: str
    chunk_index: int
    progress: float


class UploadCompleteResponse(BaseModel):
    status: str
    upload_id: str
    message: str


class UploadStatusResponse(BaseModel):
    upload_id: str
    status: str
    progress: float
    message: str
    file: Optional[dict] = None
