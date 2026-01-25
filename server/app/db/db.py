from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from fastapi import HTTPException

from app.config import settings
from app.logger import logger

engine = create_async_engine(settings.database_url, echo=False)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession, autoflush=False,
                                       autocommit=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except HTTPException:
            # Re-raise HTTPException to preserve status codes (e.g., 401, 403)
            await session.rollback()
            raise
        except Exception as e:
            logger.error(f"Error while getting db {e}")
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_db():
    async with engine.connect() as connection:
        try:
            await connection.execute(text("SELECT 1"))
            logger.info("Database connected successfully ✅")
        except Exception as e:
            logger.error(f"Error while getting db {e}")
