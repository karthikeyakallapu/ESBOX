from typing import Optional

from fastapi import APIRouter, Depends ,HTTPException , Header
from fastapi.params import Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.file import FileUpdate
from app.services.files.file_manager import file_manager
from app.services.files.file_stream_manager import file_stream_manager
router = APIRouter()

@router.get("/{file_id}/view")
async def get_file(
    file_id: int,
    request: Request,
    user = Depends(get_current_user),
    db = Depends(get_db)
):
    try:

        range_header = request.headers.get("range")

        result = await file_stream_manager.stream_file(
            file_id=file_id,
            user_id=user.get("id"),
            db=db,
            request=request,
            range_header= range_header,
            disposition="inline"
        )

        return result

    except HTTPException as e:
        logger.error(f"HTTP error streaming file {file_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error streaming file {file_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error streaming file: {str(e)}"
        )


@router.get("/{file_id}/download")
async def download_file(
    file_id: int,
    request: Request,
    user = Depends(get_current_user),
    db = Depends(get_db)
):
    try:

        range_header = request.headers.get("range")

        result = await file_stream_manager.stream_file(
            file_id=file_id,
            user_id=user.get("id"),
            db=db,
            request=request,
            range_header= range_header,
            disposition="attachment"
        )

        return result

    except HTTPException as e:
        logger.error(f"HTTP error streaming file {file_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error streaming file {file_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error streaming file: {str(e)}"
        )

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


@router.get("/search")
async def search_files( q: str = Query(...), user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        results = await file_manager.search_files(
            query=q,
            user_id=user.get("id"),
            db=db,
        )
        return results
    except Exception as e:
        logger.error(f"Error searching files with query '{q}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching files: {str(e)}")