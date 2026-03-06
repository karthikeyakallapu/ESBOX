from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.file import FileShareCreate, FileShareVerify, UpdateFileShare
from app.services.files.ShareLinkManager import share_link_manager

router = APIRouter()


@router.post("")
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

@router.get("")
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

@router.delete("/{token}")
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


@router.patch("/{token}")
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

@router.post("/{token}/verify")
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

@router.get("/{token}/stream")
async def stream_shared_file(
    token: str,
    range_header: Optional[str] = Header(None, alias="Range"),
    db: AsyncSession = Depends(get_db)
):
    try:
        stream_response = await share_link_manager.stream_shared_file(token, range_header, db)
        return stream_response
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        raise e