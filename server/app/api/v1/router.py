from fastapi import APIRouter
from fastapi.params import Depends
from fastapi.responses import JSONResponse
from app.config import settings
from app.db.db import get_db

from app.schemas.user import UserCreate, RegisterResponse, UserLogin, LoginResponse
from app.services.authservice.user import UserService

router = APIRouter()

user_service = UserService()


@router.get("/health")
async def health():
    return {"status": "Server up with version {}".format(settings.version)}


@router.post("/auth/register", response_model=RegisterResponse, status_code=201)
async def register(user: UserCreate, db=Depends(get_db)):
    try:
        user = await user_service.register_user(db, user)
        if not user:
            return JSONResponse(status_code=500, content={"message": "Registration failed"})

        return {
            "message": "User Created Successfully",
            "user": user
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})


@router.post("/auth/login", status_code=200)
async def login(user: UserLogin, response_model=LoginResponse, db=Depends(get_db)):
    try:
        token = await user_service.login_user(db, user)
        return {"message": "Login Successful",
                "token": token}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})
