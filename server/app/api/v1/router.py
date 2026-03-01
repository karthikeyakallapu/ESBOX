from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.folder_router import router as folder_router
from app.api.v1.tele_router import router as telegram_router
from app.config import settings
from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.user import UserCreate, RegisterResponse, UserLogin, UserResponse, CurrentUserResponse, UpdateTrash, \
    UserPasswordReset, UserToken, UserEmail
from app.services.auth.user import UserService
from app.services.folders.folder_manager import folder_manager
from app.api.v1.file_router import router as file_router
from app.api.v1.upload_router import router as upload_router
from app.api.v1.oauth_router import router as oauth_router

router = APIRouter()

router.include_router(telegram_router, prefix="/telegram")
router.include_router(folder_router, prefix="/folders")
router.include_router(file_router, prefix="/files")
router.include_router(upload_router , prefix="/upload")
router.include_router(oauth_router, prefix="/oauth")


user_service = UserService()


@router.get("/health")
async def health():
    return {"status": "Server up with version {}".format(settings.version)}


@router.post("/auth/register", response_model=RegisterResponse, status_code=201)
async def register(user: UserCreate, db=Depends(get_db)):
    try:
        created_user = await user_service.register_user(db, user)
        if not created_user:
            raise HTTPException(status_code=500, detail="Registration failed")

        user_response = UserResponse.model_validate(created_user)

        return {
            "message": "User Created Successfully. Please verify your email.",
            "user": user_response
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Internal server error"})


@router.post("/auth/login", status_code=200)
async def login(user: UserLogin, response: Response, db=Depends(get_db)):
    try:
        tokens = await user_service.login_user(db, user)

        access_token_expire = 60 * 60  # seconds
        refresh_token_expire = 7 * 24 * 60 * 60  # 7 days

        response.set_cookie(
            key="access_token",
            value=tokens.get("access_token", None),
            httponly=True,
            secure=True if settings.environment == "production" else False,
            samesite="none" if settings.environment == "production" else "lax",
            max_age=access_token_expire)

        response.set_cookie(
            key="refresh_token",
            value=tokens.get("refresh_token", None),
            httponly=True,
            secure=True if settings.environment == "production" else False,
            samesite="none" if settings.environment == "production" else "lax",
            max_age=refresh_token_expire)

        return {"message": "Login Successful"}

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})


@router.post("/auth/refresh")
async def refresh_token(
        request: Request,
        response: Response,
        db: AsyncSession = Depends(get_db)
):
    try:
        refresh_token = request.cookies.get("refresh_token")

        # If not in cookies, try Authorization header
        if not refresh_token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                refresh_token = auth_header.split(" ")[1]

        if not refresh_token:
            raise HTTPException(
                status_code=401,
                detail="Refresh token not provided"
            )

        result = await user_service.refresh_access_token(db, refresh_token)

        # Set the new access token in cookie
        if result.get("access_token"):
            access_token_expire = 15 * 60  # seconds
            response.set_cookie(
                key="access_token",
                value=result["access_token"],
                httponly=True,
                secure=True if settings.environment == "production" else False,
                samesite="none" if settings.environment == "production" else "lax",
                max_age=access_token_expire
            )

        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})


@router.post("/auth/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        """Logout by revoking the refresh token"""
        refresh_token = request.cookies.get("refresh_token")

        # If not in cookies, try Authorization header
        if not refresh_token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                refresh_token = auth_header.split(" ")[1]

        if not refresh_token:
            raise HTTPException(
                status_code=401,
                detail="Refresh token not provided"
            )

        result = await user_service.logout_user(db, refresh_token)

        # Clear cookies with same attributes as when they were set
        response.delete_cookie(
            key="access_token",
            httponly=True,
            secure=True if settings.environment == "production" else False,
            samesite="none" if settings.environment == "production" else "lax"
        )
        response.delete_cookie(
            key="refresh_token",
            httponly=True,
            secure=True if settings.environment == "production" else False,
            samesite="none" if settings.environment == "production" else "lax"
        )

        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})


@router.post("/auth/logout-all")
async def logout_all(response: Response, current_user: dict = Depends(get_current_user),
                     db: AsyncSession = Depends(get_db)):
    """Logout from all devices by revoking all refresh tokens"""
    result = await user_service.logout_all_devices(db, current_user["id"])

    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True if settings.environment == "production" else False,
        samesite="none" if settings.environment == "production" else "lax"
    )
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=True if settings.environment == "production" else False,
        samesite="none" if settings.environment == "production" else "lax"
    )

    return result


@router.get("/auth/me", response_model=CurrentUserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user


@router.post("/auth/forgot-password")
async def forgot_password(user : UserEmail , db: AsyncSession = Depends(get_db)):
    try:
        result = await user_service.initiate_password_reset(db, user.email)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})

@router.post("/auth/reset-password")
async def reset_password(user : UserPasswordReset , db: AsyncSession = Depends(get_db)):
    try:
        result = await user_service.validate_password_reset_token(db, user.token , user.new_password)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})

@router.post("/auth/verify-email")
async def verify_email(user : UserToken , db: AsyncSession = Depends(get_db)):
    try:
        result = await user_service.validate_email_verification_token(db, user.token)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})

@router.post("/auth/resend-verification")
async def resend_verification_email(user : UserEmail , db: AsyncSession = Depends(get_db)):
    try:
        token = await user_service.send_verification_email(db, user.email)

        if token:
            return {"message": "Verification email resent successfully"}

        return {"message": "Verification email resent failed"}

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})

@router.get("/trash")
async def get_trash(user = Depends(get_current_user), db = Depends(get_db)):
    try :
        trash = await folder_manager.get_user_trash(user.get('id'), db)
        return trash
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})

@router.patch("/trash")
async def restore_from_trash(trash : UpdateTrash, user = Depends(get_current_user), db = Depends(get_db)):
    try :
        restored_item = await folder_manager.restore_from_trash(trash.item_id, trash.item_type, user.get('id'), db)
        return restored_item
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})


@router.delete("/trash")
async def delete_from_trash(trash : UpdateTrash, user=Depends(get_current_user), db=Depends(get_db)):
    try:
        deleted_item = await folder_manager.delete_from_trash(trash.item_id, trash.item_type, user.get('id'), db)
        return deleted_item
    except HTTPException as e:
        logger.error(e)
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})