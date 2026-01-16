from datetime import timedelta, datetime, timezone

from pwdlib import PasswordHash
import jwt

from app.config import settings
from app.logger import logger

password_hash = PasswordHash.recommended()


def hash_password(password):
    hashed_password = password_hash.hash(password)
    return hashed_password


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.token_secret, algorithm=settings.algorithm)
        return encoded_jwt
    except Exception as e:
        logger.error(e)
        raise e
