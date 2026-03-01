from datetime import timedelta, datetime, timezone

from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from app.repositories.refresh_token import refresh_token_repo
from app.services.auth.google_oauth_service import google_oauth_service
from app.helpers.auth import create_token
from app.models.user import User
from app.db.db import get_db
from app.config import settings
import secrets

router = APIRouter()


@router.get("/google")
async def google_login():

    state = secrets.token_urlsafe(32)

    google_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.google_client_id}"
        f"&redirect_uri={settings.google_redirect_uri}"
        "&response_type=code"
        "&scope=openid email profile"
        f"&state={state}"
    )

    response = RedirectResponse(google_url)

    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        secure=True if settings.environment == "production" else False,
        samesite="none" if settings.environment == "production" else "lax",
        max_age=600,
        path="/",
    )

    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str,
    state: str,
    db=Depends(get_db),
):

    cookie_state = request.cookies.get("oauth_state")

    if not cookie_state or cookie_state != state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    token_data = await google_oauth_service.exchange_code(code)

    user_info = await google_oauth_service.get_user_info(
        token_data["access_token"]
    )

    name = user_info.get("name") or user_info["email"].split("@")[0]
    email = user_info["email"]

    # simple username cleanup
    username = name.replace(" ", "").lower()

    google_id = user_info["sub"]

    result = await db.execute(
        select(User).where(User.provider_id == google_id)
    )

    user = result.scalar_one_or_none()

    if not user:

        result = await db.execute(
            select(User).where(User.email == email)
        )

        user = result.scalar_one_or_none()

        if user:
            # Attach Google to existing account
            user.provider = "google"
            user.provider_id = google_id
            user.is_verified = True

            await db.commit()
            await db.refresh(user)

    # If still not found → create new user
    if not user:

        base_username = (
            user_info.get("name", email.split("@")[0])
            .replace(" ", "")
            .lower()
        )

        username = base_username
        counter = 1

        # Ensure username uniqueness
        while True:
            result = await db.execute(
                select(User).where(User.username == username)
            )
            existing_user = result.scalar_one_or_none()

            if not existing_user:
                break

            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=email,
            provider="google",
            provider_id=google_id,
            password=None,
            is_verified=True,
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

    payload = {
        "id": user.id,
        "email": user.email,
        "username": user.username
    }

    # Generate Access Token
    refresh_token_expires = timedelta(days=7)
    access_token = create_token("ACCESS", payload, expires_delta=timedelta(minutes=60))

    # Generate Refresh Token
    refresh_token = create_token("REFRESH", payload, expires_delta=refresh_token_expires)

    # Store refresh token in database
    await refresh_token_repo.create_refresh_token(
        db=db,
        token=refresh_token,
        token_info={
            "user_id": user.id,
            "expires_at": datetime.now(timezone.utc) + refresh_token_expires,
        })


    response = RedirectResponse(F"{settings.frontend_url}/dashboard")

    access_token_expire = 60 * 60  # seconds
    refresh_token_expire = 7 * 24 * 60 * 60  # 7 days

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True if settings.environment == "production" else False,
        samesite="none" if settings.environment == "production" else "lax",
        max_age=access_token_expire,
        path="/",
    )

    response.set_cookie(
        key="refresh_token",
        value= refresh_token,
        httponly=True,
        secure=True if settings.environment == "production" else False,
        samesite="none" if settings.environment == "production" else "lax",
        max_age=refresh_token_expire)

    response.delete_cookie("oauth_state", path="/")

    return response