from datetime import timedelta, datetime, timezone

from fastapi import HTTPException, status

from app.helpers.auth import hash_password, verify_password, create_token
from app.logger import logger
from app.models.user import User
from app.repositories.refresh_token import RefreshTokenRepository
from app.repositories.user import UserRepository


class UserService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.refresh_token_repo = RefreshTokenRepository()

    async def register_user(self, db, user):
        try:
            existing_user = await self.user_repo.check_user_exists(db, user.email, user.username)

            if existing_user:
                if existing_user.email == user.email:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Email already exists"
                    )
                if existing_user.username == user.username:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Username already exists"
                    )

            user = User(email=user.email, username=user.username, password=hash_password(user.password))

            db.add(user)
            await db.commit()
            await db.refresh(user)

            return user
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal server error")

    async def login_user(self, db, user, device_info: str = None):
        try:

            existing_user = await self.user_repo.get_user_by_email(db, user.email)

            if not existing_user:
                raise HTTPException(status_code=400, detail="Email does not exist")

            valid_password = verify_password(user.password, existing_user.password)

            if not valid_password:
                raise HTTPException(status_code=400, detail="Invalid password")

            if existing_user and not existing_user.is_verified:
                raise HTTPException(status_code=400, detail="Please Verify your mail")

            payload = {
                "id": existing_user.id,
                "email": existing_user.email,
                "username": existing_user.username
            }

            # Generate Access Token
            refresh_token_expires = timedelta(days=7)
            access_token = create_token("ACCESS", payload, expires_delta=timedelta(minutes=60))

            # Generate Refresh Token
            refresh_token = create_token("REFRESH", payload, expires_delta=refresh_token_expires)

            # Store refresh token in database
            await self.refresh_token_repo.create_refresh_token(
                db=db,
                token=refresh_token,
                token_info={
                    "user_id": existing_user.id,
                    "expires_at": datetime.now(timezone.utc) + refresh_token_expires,
                    "device_info": device_info

                })

            return {"access_token": access_token, "refresh_token": refresh_token}

        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal server error")

    async def refresh_access_token(self, db, refresh_token: str):
        """Generate new access token using refresh token from DB"""
        try:
            # Check if token exists in DB and is valid
            token_record = await self.refresh_token_repo.get_refresh_token(db, refresh_token)

            if not token_record:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired refresh token"
                )

            user = await self.user_repo.get_user_by_id(db, token_record.user_id)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )

            # Generate new access token
            payload = {
                "id": user.id,
                "email": user.email,
                "username": user.username
            }

            access_token = create_token("ACCESS", payload, expires_delta=timedelta(minutes=30))

            return {"access_token": access_token}

        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal server error")

    async def logout_user(self, db, refresh_token: str):
        try:
            await self.refresh_token_repo.revoke_token(db, refresh_token)
            return {"message": "Logged out successfully"}
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal server error")

    async def logout_all_devices(self, db, user_id: int):
        """Revoke all refresh tokens for a user"""
        try:
            count = await self.refresh_token_repo.revoke_all_user_tokens(db, user_id)
            return {"message": f"Logged out from {count} devices"}
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Internal server error")
