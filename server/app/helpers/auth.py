from datetime import timedelta, datetime, timezone

from pwdlib import PasswordHash
import jwt

from app.config import settings
from app.logger import logger
import secrets
import hashlib
from datetime import datetime, timedelta


password_hash = PasswordHash.recommended()


def hash_password(password):
    hashed_password = password_hash.hash(password)
    return hashed_password


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def create_token(token_type, data: dict, expires_delta: timedelta | None = None):
    try:
        if not expires_delta:
            logger.error("No expiry time")
            return None

        to_encode = data.copy()

        expire = datetime.now(timezone.utc) + expires_delta

        to_encode.update({"exp": expire})

        secret = settings.access_token_secret if token_type == "ACCESS" else settings.refresh_token_secret

        encoded_jwt = jwt.encode(to_encode, secret, algorithm=settings.algorithm)
        return encoded_jwt
    except Exception as e:
        logger.error(e)
        raise e


def decode_token(token: str, token_type: str = "ACCESS"):
    """Decode and verify JWT token"""
    try:
        secret = settings.access_token_secret if token_type == "ACCESS" else settings.refresh_token_secret
        payload = jwt.decode(token, secret, algorithms=[settings.algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {e}")
        return None
    except Exception as e:
        logger.error(f"Token decode error: {e}")
        return None


def generate_reset_token():
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    return raw_token, token_hash

def get_computed_hash(raw_token):
    computed_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    return computed_hash