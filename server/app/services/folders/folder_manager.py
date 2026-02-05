from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.logger import logger
from app.repositories.folder import folder_repository


class FolderManager:
    @staticmethod
    async def create_folder(folder, user_id: int, db: AsyncSession):
        try:
            if folder.parent_id is not None:
                parent = await folder_repository.is_parent_exist(folder.parent_id, user_id, db)
                if not parent:
                    raise HTTPException(status_code=404, detail="Parent not found")

                duplicate = await folder_repository.find_duplicate(folder.name, folder.parent_id, user_id, db)

                if duplicate:
                    raise HTTPException(status_code=403, detail="Folder already exists")

            folder = await folder_repository.create_folder(folder, user_id, db)
            return folder
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def get_children(parent_id, user_id :int, db : AsyncSession):
        try:
            children = await folder_repository.get_children(parent_id, user_id, db)

            return children
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def delete_folder(parent_id, user_id :int, db : AsyncSession):
        try:
            if not parent_id:
                raise HTTPException(status_code=412, detail="Parent id is required")
            folder = await folder_repository.delete_folder(parent_id, user_id, db)
            return folder
        except Exception as e:
            logger.error(e)


    @staticmethod
    async def update_folder(folder, user_id :int, db : AsyncSession):
        try:
            if not folder.id:
                raise HTTPException(status_code=412, detail="Parent id is required")
            folder = await folder_repository.update_folder( folder.id,folder.name, user_id, db)
            return folder
        except Exception as e:
            logger.error(e)

folder_manager = FolderManager()
