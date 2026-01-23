from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.logger import logger
from app.models.refresh_token import RefreshToken
from datetime import datetime, timezone


class RefreshTokenRepository:
    @staticmethod
    async def create_refresh_token(db: AsyncSession, token: str, token_info: dict):
        try:
            refresh_token = RefreshToken(
                token=token,
                user_id=token_info.get("user_id"),
                expires_at=token_info.get("expires_at"),
                device_info=token_info.get("device_info")
            )
            db.add(refresh_token)
            await db.commit()
            await db.refresh(refresh_token)
            return refresh_token
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def get_refresh_token(db: AsyncSession, token: str):
        try:
            result = await db.execute(
                select(RefreshToken).where(
                    and_(
                        RefreshToken.token == token,
                        RefreshToken.revoked == False,
                        RefreshToken.expires_at > datetime.now(timezone.utc)
                    )
                )
            )
            return result.scalars().first()
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def revoke_token(db: AsyncSession, token: str):
        try:
            result = await db.execute(
                select(RefreshToken).where(RefreshToken.token == token)
            )
            refresh_token = result.scalars().first()

            if refresh_token:
                refresh_token.revoked = True
                await db.commit()

            return refresh_token
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def revoke_all_user_tokens(db: AsyncSession, user_id: int):
        try:
            result = await db.execute(
                select(RefreshToken).where(
                    and_(
                        RefreshToken.user_id == user_id,
                        RefreshToken.revoked == False
                    )
                )
            )
            tokens = result.scalars().all()

            for token in tokens:
                token.revoked = True

            await db.commit()
            return len(tokens)
        except Exception as e:
            logger.error(e)
            raise e

    @staticmethod
    async def cleanup_expired_tokens(db: AsyncSession):
        """Remove expired tokens from database"""
        try:
            result = await db.execute(
                select(RefreshToken).where(RefreshToken.expires_at < datetime.now(timezone.utc))
            )
            expired_tokens = result.scalars().all()

            for token in expired_tokens:
                await db.delete(token)

            await db.commit()
            return len(expired_tokens)
        except Exception as e:
            logger.error(e)
            raise e
