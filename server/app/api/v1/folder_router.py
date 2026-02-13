from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.folder import FolderCreate, Parent, Folder
from app.services.folders.folder_manager import folder_manager

router = APIRouter()


@router.post("/create")
async def create_folder(folder: FolderCreate, user=Depends(get_current_user),
                        db: AsyncSession = Depends(get_db)):
    try:
        folder = await folder_manager.create_folder(folder, user.get("id"), db)
        if not folder:
            return {"message": "Folder creation failed"}
        return {"message": "Folder created successfully", "folder": folder}
    except Exception as e:
        logger.error(e)
        raise e

@router.get("/getAll")
async def get_folders( parent_id: int | None = Query(None), user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        children = await folder_manager.get_children(parent_id, user.get("id"),db)
        return  children
    except Exception as e:
        logger.error(e)
        raise e

@router.delete("/delete")
async def delete_folder(parent_id:int, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        folder = await folder_manager.delete_folder(parent_id, user.get("id"),db)
        if not folder:
            return {"message": "Folder deletion failed"}
        return {"message": "Folder deleted successfully"}
    except Exception as e:
        logger.error(e)
        raise e

@router.patch("/rename")
async def update_folder(folder:Folder, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        folder = await folder_manager.update_folder(folder, user.get("id"), db)
        if not folder:
            return {"message": "Folder rename failed"}
        return {"message": "Folder renamed successfully"}
    except Exception as e:
        logger.error(e)
        raise e