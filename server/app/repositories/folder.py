from sqlalchemy import select, func
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
        return result.scalar_one_or_none()

    @staticmethod
    async def create_folder(folder, user_id: int, db: AsyncSession):
        folder = UserFolder(name=folder.name, parent_id=folder.parent_id, user_id=user_id)
        db.add(folder)
        await db.commit()
        await db.refresh(folder)
        return folder


folder_repository = FolderRepository()
