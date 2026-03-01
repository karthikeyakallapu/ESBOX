from pydantic import BaseModel, EmailStr, ConfigDict, field_validator, model_validator


class UserCreate(BaseModel):
    username: str
    password: str
    confirm_password: str
    email: EmailStr

    # Username validation
    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Username cannot be empty")

        value = value.strip()

        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters long")

        return value

    # Password strength validation
    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if value.islower() or value.isupper():
            raise ValueError("Password must contain both upper and lower case letters")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one number")
        return value

    # Cross-field validation
    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


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

class CurrentUserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)

class UpdateTrash(BaseModel):
    item_id: int
    item_type: str  # "folder" or "file"

class UserEmail(BaseModel):
    email: EmailStr

class UserPasswordReset(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if value.islower() or value.isupper():
            raise ValueError("Password must contain both upper and lower case letters")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one number")
        return value


class UserToken(BaseModel):
    token: str