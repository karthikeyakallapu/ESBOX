from fastapi import APIRouter, Request, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.folder import FileMetadata
from app.schemas.telegram import TelegramLoginBase, TelegramAuthResponse, TelegramAuth
from app.services.telegram.auth_service import TelegramAuthService
from app.services.telegram.client_manager import telegram_client_manager
from app.services.telegram.storage_service import tele_storage_service

router = APIRouter()


@router.post("/login")
async def login_telegram(login_data: TelegramLoginBase, request: Request, current_user=Depends(get_current_user),
                         db: AsyncSession = Depends(get_db)):
    try:

        user_id = current_user.get("id")

        auth_service = TelegramAuthService(user_id, db)

        result = await auth_service.phone_authenticate(
            login_data.phone,
            request.client.host
        )

        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error'))

        return TelegramAuthResponse(
            success=True,
            message=result['message']
        )

    except Exception as err:
        logger.error(err)
        raise err


@router.post("/verify")
async def verify_code(auth: TelegramAuth, request: Request, db: AsyncSession = Depends(get_db),
                      current_user=Depends(get_current_user)):
    try:
        user_id = current_user.get("id")

        auth_service = TelegramAuthService(user_id, db)

        result = await auth_service.verify_phone_code(auth.code)

        return result
    except Exception as err:
        logger.error(err)
        raise err


@router.get("/session-status")
async def check_session_status(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Check if the current user has a valid Telegram session"""
    try:
        has_session = await telegram_client_manager.has_session(user["id"], db)
        return {
            "has_session": has_session,
            "message": "Telegram session found" if has_session else "No Telegram session found"
        }
    except Exception as err:
        logger.error(f"Error checking session status: {err}")
        return {
            "has_session": False,
            "message": "Error checking Telegram session status"
        }
