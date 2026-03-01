import httpx

from app.config import settings


class GoogleOAuthService:

    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"

    @staticmethod
    async def exchange_code(code: str) :
         async with httpx.AsyncClient() as client:
            response = await client.post(
                GoogleOAuthService.TOKEN_URL,
                data={
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.google_redirect_uri,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def get_user_info(access_token: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GoogleOAuthService.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"}
            )
        response.raise_for_status()
        return response.json()

google_oauth_service = GoogleOAuthService()