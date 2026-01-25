from typing import Optional

from pydantic import BaseModel


class TelegramLoginBase(BaseModel):
    phone: str


class TelegramAuthResponse(BaseModel):
    success: bool
    message: str
    requires_2fa: bool = False
    telegram_user: Optional[dict] = None


class TelegramAuth(BaseModel):
    code: str
