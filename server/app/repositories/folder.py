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
    async def find_duplicate(name: str, parent_id: int, user_id: int, db: AsyncSession):
        name = name.lower().strip()
        result = await  db.execute(
            select(UserFolder).where(func.lower(UserFolder.name) == name,
                                     UserFolder.parent_id == parent_id, UserFolder.user_id == user_id))
        return result.scalars().first()

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
                select(UserFolder).where(UserFolder.parent_id.is_(None), UserFolder.user_id == user_id))
            folders = result.scalars().all()
            return folders
        result = await db.execute(select(UserFolder).where(UserFolder.parent_id == parent_id, UserFolder.user_id == user_id))
        return result.scalars().all()

    @staticmethod
    async def delete_folder(parent_id, user_id: int, db: AsyncSession):
        result = await db.execute(
            delete(UserFolder).where(UserFolder.id == parent_id, UserFolder.user_id == user_id)
        )
        await db.commit()
        return result.rowcount

    @staticmethod
    async def update_folder(folder_id : int, folder_name :str, user_id: int, db: AsyncSession):
         result = await  db.execute(
             update(UserFolder).where(UserFolder.id == folder_id, UserFolder.user_id == user_id).values(name=folder_name)
         )
         await db.commit()
         return result.rowcount

folder_repository = FolderRepository()
