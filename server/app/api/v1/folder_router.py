from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.folder import FolderCreate, FolderUpdate
from app.services.folders.folder_manager import folder_manager

router = APIRouter()


@router.post("")
async def create_folder(folder: FolderCreate, user=Depends(get_current_user),
                        db: AsyncSession = Depends(get_db)):
    try:
        folder = await folder_manager.create_folder(folder, user.get("id"), db)
        if not folder:
            return {"message": "Folder creation failed"}
        return folder
    except Exception as e:
        logger.error(e)
        raise e

@router.get("")
async def get_folders(folder_id: int | None = None, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        children = await folder_manager.get_children(folder_id, user.get("id"),db)
        return children
    except Exception as e:
        logger.error(e)
        raise e


@router.delete("/{folder_id}")
async def delete_folder(folder_id :int, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        folder = await folder_manager.delete_folder(folder_id, user.get("id"),db)
        if not folder:
            return {"message": "Folder deletion failed"}
        return folder
    except HTTPException as e:
        logger.error(f"HTTP Error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(e)
        raise e

@router.patch("/{folder_id}")
async def update_folder(folder_id: int, folder: FolderUpdate, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        updated_folder = await folder_manager.update_folder(folder_id, folder, user.get("id"), db)

        if not updated_folder:
            raise HTTPException(status_code=500, detail="Folder Update failed")

        return updated_folder

    except HTTPException as e:
        logger.error(f"HTTP Error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise e