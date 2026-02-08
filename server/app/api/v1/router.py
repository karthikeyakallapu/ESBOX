from fastapi import APIRouter, HTTPException, Request
from fastapi.params import Depends
from fastapi.responses import JSONResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.folder_router import router as folder_router
from app.api.v1.tele_router import router as telegram_router
from app.config import settings
from app.db.db import get_db
from app.dependencies.auth import get_current_user
from app.logger import logger
from app.schemas.user import UserCreate, RegisterResponse, UserLogin, UserResponse, CurrentUserResponse
from app.services.auth.user import UserService

router = APIRouter()

router.include_router(telegram_router, prefix="/telegram")
router.include_router(folder_router, prefix="/folders")

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
            "message": "User Created Successfully",
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
            samesite="none",
            max_age=access_token_expire)

        response.set_cookie(
            key="refresh_token",
            value=tokens.get("refresh_token", None),
            httponly=True,
            secure=True if settings.environment == "production" else False,
            samesite="none",
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
                samesite="none",
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

        # Clear cookies
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")

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

    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")

    return result


@router.get("/auth/me", response_model=CurrentUserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user
