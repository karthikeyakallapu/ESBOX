from typing import Optional, Dict, Any
from pydantic import BaseModel

class FileUpdate(BaseModel):
    action: str
    payload: Optional[Dict[str, Any]] = None