from typing import Optional

from fastapi import APIRouter, Depends ,HTTPException , Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.file import FileUpdate
from app.services.files.file_manager import file_manager
# from app.services.files.file_stream_manager import file_stream_manager
router = APIRouter()

# @router.get("/stream/{file_id}")
# async def get_file(
#     file_id: int,
#     range_header: Optional[str] = Header(None, alias="Range"),
#     user = Depends(get_current_user),
#     db = Depends(get_db)
# ):
#     try:
#         if range_header:
#             return await file_stream_manager.partial_stream_file(file_id, range_header, user.get("id"), db)
#
#         file = await file_stream_manager.stream_file(file_id, user.get("id"), db)
#         return file
#     except HTTPException as e:
#         logger.error(f"HTTP error streaming file {file_id}: {e.detail}")
#         raise e
#     except Exception as e:
#         logger.error(f"Unexpected error streaming file {file_id}: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error streaming file: {str(e)}"
#         )

@router.patch("/{file_id}")
async def update_file(file_id: int,file: FileUpdate,user=Depends(get_current_user),db: AsyncSession = Depends(get_db)):
    try:
        updated_file = await file_manager.update_file(
            file_id,
            file,
            user.get("id"),
            db,
        )

        if not updated_file:
            raise HTTPException(status_code=500, detail="File update Failed")

        return updated_file

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        raise e
