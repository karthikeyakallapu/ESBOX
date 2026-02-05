from fastapi import APIRouter, Depends
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
        return folder
    except Exception as e:
        logger.error(e)
        raise e

@router.get("/getAll")
async def get_folders(parent: Parent, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        folders = await folder_manager.get_children(parent.id, user.get("id"),db)
        return  folders
    except Exception as e:
        logger.error(e)
        raise e

@router.delete("/delete")
async def delete_folder(parent:Parent, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        folder = await folder_manager.delete_folder(parent.id, user.get("id"),db)
        return folder
    except Exception as e:
        logger.error(e)
        raise e

@router.patch("/update")
async def update_folder(folder:Folder, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        folder = await folder_manager.update_folder(folder, user.get("id"), db)
        return folder
    except Exception as e:
        logger.error(e)
        raise e