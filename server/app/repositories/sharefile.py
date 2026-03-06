from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import selectinload, load_only

from app.models import ShareLink, UserFile


class ShareFileRepository:
    @staticmethod
    async def add_link(link, db):
        link = ShareLink( **link )
        db.add(link)
        await db.commit()
        await db.refresh(link)
        return link

    @staticmethod
    async def get_link(share_token, db):
        result = await db.execute(
            select(ShareLink).where(ShareLink.share_token == share_token)
        )
        link = result.scalar_one_or_none()
        return link


    @staticmethod
    async def get_link_by_file_and_user(file_id, user_id, db):
        result = await db.execute(
            select(ShareLink).where(
                ShareLink.file_id == file_id,
                ShareLink.created_by == user_id,
                ShareLink.expires_at > datetime.now(timezone.utc)
            )
        )
        link = result.scalars().first()
        return link

    @staticmethod
    async def get_links_by_user(user_id, db):
        query = (
                select(ShareLink)
                .options(
                    load_only(
                        ShareLink.id,
                        ShareLink.share_token,
                        ShareLink.expires_at,
                        ShareLink.created_at
                    ),
                    selectinload(ShareLink.file).load_only(
                        UserFile.id,
                        UserFile.name,
                        UserFile.size,
                        UserFile.mime_type
                    )
                )
            )
        result = await db.execute(query)
        links =  result.scalars().all()
        return links









share_file_repository = ShareFileRepository()