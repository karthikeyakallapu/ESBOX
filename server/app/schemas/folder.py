from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class FolderResponse(BaseModel):
    folder_id: int
    folder_name: str
    parent_id: int
    is_root: bool
    is_starred: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
