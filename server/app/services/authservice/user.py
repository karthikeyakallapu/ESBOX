from datetime import timedelta

from fastapi import HTTPException

from app.helpers.auth import hash_password, verify_password, create_access_token
from app.logger import logger
from app.models.user import User
from app.repositories.user import UserRepository


class UserService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def register_user(self, db, user):
        try:

            existing_user = await self.user_repo.check_user_exists(db, user.email, user.username)

            if existing_user:
                if existing_user.email == user.email:
                    raise HTTPException(
                        status_code=400,
                        detail="Email already exists"
                    )
                if existing_user.username == user.username:
                    raise HTTPException(
                        status_code=400,
                        detail="Username already exists"
                    )

            user = User(email=user.email, username=user.username, password=hash_password(user.password))

            db.add(user)
            await db.commit()
            await db.refresh(user)

            return user
        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            return e

    async def login_user(self, db, user):
        try:

            existing_user = await self.user_repo.get_user_by_email(db, user.email)

            if not existing_user:
                raise HTTPException(status_code=400, detail="Email does not exist")

            valid_password = verify_password(user.password, existing_user.password)

            if not valid_password:
                raise HTTPException(status_code=400, detail="Invalid password")

            # Generate a token
            payload = {
                "id": existing_user.id,
                "email": existing_user.email,
                "username": existing_user.username
            }

            token = create_access_token(payload, expires_delta=timedelta(minutes=30))

            return token

        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
