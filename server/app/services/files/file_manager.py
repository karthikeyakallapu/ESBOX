from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.logger import logger
from app.repositories.file import file_repository


class FileManager:

    @staticmethod
    async def update_file(file_id: int, data, user_id: int, db: AsyncSession):

        try:

            current_file = await file_repository.get_file_by_id(
                file_id=file_id,
                user_id=user_id,
                db=db
            )

            if not current_file:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found"
                )

            fields_to_update = {}


            if data.action == "star":
                fields_to_update["is_starred"] = True

            elif data.action == "unstar":
                fields_to_update["is_starred"] = False


            elif data.action == "rename":
                if not data.payload or "new_name" not in data.payload:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="New name required"
                    )

                new_name = data.payload["new_name"].strip()

                if not new_name:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="File name cannot be empty"
                    )

                duplicate = await file_repository.find_duplicate(
                    name=new_name,
                    parent_id=current_file.parent_id,
                    user_id=user_id,
                    db=db,
                    exclude_file_id=file_id
                )

                if duplicate:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="File with same name already exists"
                    )

                fields_to_update["filename"] = new_name

            elif data.action == "delete":
                fields_to_update["is_deleted"] = True
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid action"
                )

            # Update in DB
            updated_file = await file_repository.update_file_fields(
                file_id=file_id,
                user_id=user_id,
                fields=fields_to_update,
                db=db
            )

            return updated_file

        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Failed to update file {file_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )


file_manager = FileManager()
