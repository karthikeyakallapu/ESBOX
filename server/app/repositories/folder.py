from datetime import datetime

from sqlalchemy import select, func, delete, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import UserFolder


class FolderRepository:

    @staticmethod
    async def is_parent_exist(parent_id: int, user_id: int, db: AsyncSession):
        result = await  db.execute(
            select(UserFolder).where(UserFolder.id == parent_id, UserFolder.user_id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_folder(folder_id: int, user_id: int, db: AsyncSession):
        result = await  db.execute(
            select(UserFolder).where(UserFolder.id == folder_id, UserFolder.user_id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def find_duplicate( name: str, parent_id: int, user_id: int, db: AsyncSession, exclude_folder_id: int = None):
        try:

            name = name.lower().strip()

            query = select(UserFolder).where(
                func.lower(UserFolder.name) == name,
                UserFolder.parent_id == parent_id,
                UserFolder.user_id == user_id
            )

            # Exclude the current folder when updating
            if exclude_folder_id:
                query = query.where(UserFolder.id != exclude_folder_id)

            result = await db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            raise e

    @staticmethod
    async def create_folder(folder, user_id: int, db: AsyncSession):
        folder = UserFolder(name=folder.name, parent_id=folder.parent_id, user_id=user_id)
        db.add(folder)
        await db.commit()
        await db.refresh(folder)
        return folder

    @staticmethod
    async def get_children(parent_id, user_id: int, db: AsyncSession):
        if not parent_id:
            result = await db.execute(
                select(UserFolder).where(UserFolder.parent_id.is_(None), UserFolder.user_id == user_id , UserFolder.is_deleted == False))
            folders = result.scalars().all()
            return folders
        result = await db.execute(select(UserFolder).where(UserFolder.parent_id == parent_id, UserFolder.user_id == user_id))
        return result.scalars().all()

    @staticmethod
    async def delete_folder(folder_id, user_id: int, db: AsyncSession):
        result = await db.execute(
            update(UserFolder).where(UserFolder.id == folder_id, UserFolder.user_id == user_id).values(
                is_deleted=True, updated_at=datetime.utcnow()).returning(UserFolder)
        )
        await db.commit()
        return result.scalar_one_or_none()

    @staticmethod
    async def update_folder(folder_id, folder, user_id: int, db: AsyncSession):
        statement = (
            update(UserFolder)
            .where(UserFolder.id == folder_id, UserFolder.user_id == user_id)
            .values(**folder, updated_at=datetime.utcnow())
            .returning(UserFolder)
        )
        result = await db.execute(statement)
        await db.commit()
        folder = result.scalar_one()
        return folder

    @staticmethod
    async def get_starred_folders(user_id: int, db: AsyncSession):
        result = await db.execute(
            select(UserFolder).where(UserFolder.user_id == user_id, UserFolder.is_starred == True, UserFolder.is_deleted == False)
        )
        return result.scalars().all()

    @staticmethod
    async def get_folder_trash(user_id, db):
        result = await db.execute(
            select(UserFolder).where(UserFolder.user_id == user_id, UserFolder.is_deleted == True)
        )
        folders = result.scalars().all()
        return folders

    @staticmethod
    async def restore_folder_from_trash(folder_id: int, user_id: int, db: AsyncSession):
        result = await db.execute(
            update(UserFolder)
            .where(UserFolder.id == folder_id, UserFolder.user_id == user_id)
            .values(is_deleted=False, updated_at=datetime.utcnow())
            .returning(UserFolder)
        )
        await db.commit()
        folder = result.scalar_one_or_none()
        return folder

    @staticmethod
    async def delete_folder_from_trash(folder_id: int, user_id: int, db: AsyncSession):
        result = await db.execute(
            delete(UserFolder)
            .where(UserFolder.id == folder_id, UserFolder.user_id == user_id, UserFolder.is_deleted == True)
            .returning(UserFolder)
        )
        await db.commit()
        folder = result.scalar_one_or_none()
        return folder


folder_repository = FolderRepository()
