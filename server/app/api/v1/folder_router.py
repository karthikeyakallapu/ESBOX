from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.folder import FolderCreate
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
