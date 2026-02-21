from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from telethon.tl.types import PeerChannel

from app.logger import logger
from app.repositories.file import file_repository
from app.repositories.folder import folder_repository
from app.repositories.telegram.storage import storage_repository
from app.services.telegram.client_manager import telegram_client_manager
from app.services.telegram.storage_service import tele_storage_service


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

            inner_files  = await file_repository.get_starred_files(user_id, db)
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

    @staticmethod
    async def get_user_trash(user_id: int, db: AsyncSession):
        try:
            trash_folders = await folder_repository.get_folder_trash(user_id, db)

            files = await file_repository.get_trashed_files(user_id, db)

            return {"folders":trash_folders , "files": files}
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def restore_from_trash(item_id: int, item_type: str, user_id: int, db: AsyncSession):
        try:
            if item_type == "folder":
                restored_item = await folder_repository.restore_folder_from_trash(item_id, user_id, db)
            elif item_type == "file":
                fields_to_update = {"is_deleted": False}
                restored_item = await file_repository.update_file_fields(item_id, user_id, fields_to_update, db)
            else:
                raise HTTPException(status_code=400, detail="Invalid item type")

            if not restored_item:
                raise HTTPException(status_code=404, detail="Item not found in trash")

            return restored_item
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise e


    @staticmethod
    async def delete_from_trash(item_id: int, item_type: str, user_id: int, db: AsyncSession):
        try:
            if item_type == "folder":
                deleted_item = await folder_repository.delete_folder_from_trash(item_id, user_id, db)
            elif item_type == "file":

                file_record = await file_repository.get_file_by_id(item_id, user_id, db)

                if not file_record:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

                # Check for other instances of the same file in the same Telegram channel before deleting the Telegram message
                other_instances = await storage_repository.get_other_instances_in_channel(item_id, user_id, db)

                # If there are no other instances, proceed to delete the Telegram message
                if len(other_instances) <= 1:
                    await tele_storage_service.remove_files_from_channel(user_id,db, [file_record.content_hash])

                file = await file_repository.delete_file_from_trash(item_id, user_id, db)

                return file

            else:
                raise HTTPException(status_code=400, detail="Invalid item type")

            if not deleted_item:
                raise HTTPException(status_code=404, detail="Item not found in trash")

            return deleted_item
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise e

folder_manager = FolderManager()
