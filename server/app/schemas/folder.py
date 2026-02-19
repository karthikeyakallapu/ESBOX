from datetime import datetime
from typing import Optional

from fastapi import Form
from pydantic import BaseModel, ConfigDict, field_validator


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

class Parent(BaseModel):
    id: Optional[int] = None

class Folder (BaseModel):
     id:int
     name: str


class FileMetadata(BaseModel):
    name: str
    parent_id: Optional[int] = None

    @field_validator("parent_id", mode="before")
    @classmethod
    def validate_parent_id(cls, value):
        if value == "" or value is None:
            return None
        return int(value)

    @classmethod
    def as_form(
        cls,
        name: str = Form(...),
        parent_id: str | None = Form(None),
    ):
        return cls(name=name, parent_id=parent_id)

class FolderUpdate(BaseModel):
   name: Optional[str] = None
   parent_id: Optional[int] = None
   is_starred: Optional[bool] = None
