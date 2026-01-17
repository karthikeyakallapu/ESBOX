from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from fastapi.responses import JSONResponse, Response
from app.config import settings
from app.db.db import get_db
from app.logger import logger

from app.schemas.user import UserCreate, RegisterResponse, UserLogin, LoginResponse, UserResponse
from app.services.authservice.user import UserService

router = APIRouter()

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
        token = await user_service.login_user(db, user)

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=900
        )

        return {"message": "Login Successful"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(e)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})
