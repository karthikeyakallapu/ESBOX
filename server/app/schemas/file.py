from typing import Optional, Dict, Any
from pydantic import BaseModel

class FileUpdate(BaseModel):
    action: str
    payload: Optional[Dict[str, Any]] = None

class FileShareCreate(BaseModel):
    file_id : int
    password : str
    expire_in_hours : int

class FileShareVerify(BaseModel):
    password: str

class UpdateFileShare(BaseModel):
    expire_in_hours: Optional[int] = None
    password: Optional[str] = None