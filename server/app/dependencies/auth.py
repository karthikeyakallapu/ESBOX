from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db import get_db
from app.helpers.auth import decode_token
from app.repositories.user import UserRepository

security = HTTPBearer()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Dependency to get the current authenticated user from the access token.
    Extracts token from cookies (preferred) or Authorization header.
    """
    # Try to get token from cookies first
    access_token = request.cookies.get("access_token")

    # If not in cookies, try Authorization header
    if not access_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            access_token = auth_header.split(" ")[1]

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode the token
    payload = decode_token(access_token, token_type="ACCESS")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch user from database
    user_repo = UserRepository()
    user = await user_repo.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Return user data as dict
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
    }


async def get_refresh_token_from_request(
    request: Request = None,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Dependency to extract refresh token from cookies or Authorization header.
    """
    # Try cookies first
    if request:
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token:
            return refresh_token

    # Fall back to Authorization header
    return credentials.credentials
