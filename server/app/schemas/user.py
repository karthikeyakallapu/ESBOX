from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    username: str
    password: str
    confirm_password: str
    email: EmailStr


class UserResponse(BaseModel):
    username: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)


class RegisterResponse(BaseModel):
    message: str
    user: UserResponse


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    message: str
    token: str
