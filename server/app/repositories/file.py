from datetime import datetime
from sqlalchemy import select, update, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import UserFile


class FileRepository:

    # --------------------------------------
    # GET FILE BY ID
    # --------------------------------------
    @staticmethod
    async def get_file_by_id(
        file_id: int,
        user_id: int,
        db: AsyncSession
    ):
        query = select(UserFile).where(
            UserFile.id == file_id,
            UserFile.user_id == user_id
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    # --------------------------------------
    # GENERIC UPDATE
    # --------------------------------------
    @staticmethod
    async def update_file_fields(
        file_id: int,
        user_id: int,
        fields: dict,
        db: AsyncSession
    ):
        if not fields:
            return None

        statement = (
            update(UserFile)
            .where(
                UserFile.id == file_id,
                UserFile.user_id == user_id
            )
            .values(
                **fields,
                updated_at=datetime.utcnow()
            )
            .returning(UserFile)
        )

        result = await db.execute(statement)
        await db.commit()

        return result.scalar_one_or_none()


    # --------------------------------------
    # GET STARRED FILES
    # --------------------------------------
    @staticmethod
    async def get_starred_files(
        user_id: int,
        db: AsyncSession
    ):
        query = select(UserFile).where(
            UserFile.user_id == user_id,
            UserFile.is_starred.is_(True)
        )
        result = await db.execute(query)
        return result.scalars().all()

    # --------------------------------------
    # FIND DUPLICATE NAME
    # --------------------------------------
    @staticmethod
    async def find_duplicate(
        name: str,
        parent_id: int,
        user_id: int,
        db: AsyncSession,
        exclude_file_id: int | None = None
    ):
        name = name.strip().lower()

        query = select(UserFile).where(
            func.lower(UserFile.filename) == name,
            UserFile.parent_id == parent_id,
            UserFile.user_id == user_id
        )

        if exclude_file_id:
            query = query.where(UserFile.id != exclude_file_id)

        result = await db.execute(query)
        return result.scalar_one_or_none()

    # --------------------------------------
    # GET TRASHED FILES
    # --------------------------------------

    @staticmethod
    async def get_trashed_files(
            user_id: int,
            db: AsyncSession
    ):
        query = select(UserFile).where(
            UserFile.user_id == user_id,
            UserFile.is_deleted.is_(True)
        )
        result = await db.execute(query)
        return result.scalars().all()



    @staticmethod
    async def delete_file_from_trash(file_id: int, user_id: int, db):
         query  = delete(UserFile).where(
                UserFile.id == file_id,
                UserFile.user_id == user_id,
                UserFile.is_deleted.is_(True)).returning(UserFile)

         result = await db.execute(query)
         await db.commit()

         deleted_file = result.scalar_one_or_none()
         return deleted_file

file_repository = FileRepository()
