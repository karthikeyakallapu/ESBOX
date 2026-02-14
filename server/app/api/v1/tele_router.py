from fastapi import APIRouter, Request, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.folder import FileMetadata
from app.schemas.telegram import TelegramLoginBase, TelegramAuthResponse, TelegramAuth
from app.services.telegram.auth_service import TelegramAuthService
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


#

@router.post("/upload")
async def upload_file(file_metadata: FileMetadata = Depends(FileMetadata.as_form),
        file: UploadFile = File(...),
        user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    try:
        location = await tele_storage_service.upload_file(file_metadata,user["id"], db, file)
        if not location:
            raise HTTPException(status_code=500, detail="Failed to upload file to Telegram")
        return {"message": "File uploaded successfully"}
    except Exception as err:
        logger.error(err)
        raise err

@router.delete("/delete")
async def delete_telegram_file(file_id: int, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        result = await tele_storage_service.delete_file(file_id, user["id"], db)
        return result
    except Exception as err:
        logger.error(err)
        raise err