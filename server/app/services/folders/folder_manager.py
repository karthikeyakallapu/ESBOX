from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.logger import logger
from app.repositories.folder import folder_repository
from app.repositories.telegram.storage import storage_repository


class FolderManager:
    @staticmethod
    async def create_folder(folder, user_id: int, db: AsyncSession):
        try:
            if folder.parent_id:
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
    async def get_children(parent_id, user_id: int, db: AsyncSession):
        try:
            inner_folders = await folder_repository.get_children(parent_id, user_id, db)

            inner_files = await storage_repository.get_files_in_folder(parent_id, user_id, db)

            return {"folders": inner_folders, "files": inner_files}
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def get_starred_folders(user_id: int, db:AsyncSession):
        try:
            inner_folders = await folder_repository.get_starred_folders(user_id, db)

            # inner_files = await storage_repository.get_files_in_folder(user_id, db)
            inner_files  = []

            return {"folders": inner_folders, "files": inner_files}
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def delete_folder(folder_id :int , user_id: int, db: AsyncSession):
        try:
            if not folder_id:
                raise HTTPException(status_code=412, detail="Folder id is required")
            folder = await folder_repository.delete_folder(folder_id, user_id, db)
            # TO DO : delete all inner folders and files
            return folder
        except Exception as e:
            logger.error(e)

    @staticmethod
    async def update_folder(folder_id, folder, user_id: int, db: AsyncSession):
        try:

            # Get the current folder to check its parent_id
            current_folder = await folder_repository.get_folder(folder_id, user_id, db)
            if not current_folder:
                raise HTTPException(status_code=404, detail="Folder not found")

            if folder.name is not None:
                duplicate = await folder_repository.find_duplicate(
                    folder.name,
                    current_folder.parent_id,
                    user_id,
                    db,
                    exclude_folder_id=folder_id
                )

                if duplicate:
                    raise HTTPException(status_code=403, detail="Folder already exists")

            update_folder_data = folder.model_dump(
                exclude_unset=True,
                exclude_none=True
            )

            updated_folder = await folder_repository.update_folder(folder_id, update_folder_data, user_id, db)

            return updated_folder

        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise e


folder_manager = FolderManager()
