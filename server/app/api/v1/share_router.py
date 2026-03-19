from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rate_limit import open_rate_limiter, rate_limiter
from app.logger import logger
from app.schemas.file import FileShareCreate, FileShareVerify, UpdateFileShare
from app.services.files.ShareLinkManager import share_link_manager

router = APIRouter()


@router.post(
    "",
    dependencies=[Depends(rate_limiter(30, 60))],
)
async def create_share(share : FileShareCreate, user = Depends(get_current_user), db = Depends(get_db)):
    try:
       link =  await share_link_manager.create_share_link(share, user.get("id") ,db)
       return link
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise e

@router.get(
    "",
    dependencies=[Depends(rate_limiter(60, 60))],
)
async def get_all_share_links(user = Depends(get_current_user), db = Depends(get_db)):
    try:
        links = await share_link_manager.get_share_links(user.get("id"), db)
        return links
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise e

@router.delete(
    "/{token}",
    dependencies=[Depends(rate_limiter(30, 60))],
)
async  def delete_share_link(token: str, user = Depends(get_current_user), db = Depends(get_db)):
    try:
        result = await share_link_manager.delete_share_link(token, user.get("id"), db)
        return result
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise e


@router.patch(
    "/{token}",
    dependencies=[Depends(rate_limiter(30, 60))],
)
async def update_share_link(token: str, share : UpdateFileShare, user = Depends(get_current_user), db = Depends(get_db)):
    try:
        link = await share_link_manager.update_share_link(token, share, user.get("id"), db)
        return link
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise e

@router.post(
    "/{token}/verify",
    dependencies=[Depends(open_rate_limiter(10, 300))],
)
async def verify_share_link(token: str, share  :FileShareVerify, db = Depends(get_db)):
    try:
        link = await share_link_manager.verify_share_link(token,share.password, db)
        return link
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise e

@router.get(
    "/{token}/stream",
    dependencies=[Depends(open_rate_limiter(300, 60))],
)
async def stream_shared_file(
    token: str,
    request: Request,
    range_header: Optional[str] = Header(None, alias="Range"),
    db: AsyncSession = Depends(get_db)
):
    try:
        stream_response = await share_link_manager.stream_shared_file(token, request, range_header, db)
        return stream_response
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise e