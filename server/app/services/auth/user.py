from datetime import timedelta, datetime, timezone
from typing import Literal

from fastapi import HTTPException, status

from app.helpers.auth import hash_password, verify_password, create_token, generate_reset_token, get_computed_hash
from app.logger import logger
from app.models.user import User
from app.repositories.refresh_token import RefreshTokenRepository
from app.repositories.user import UserRepository
from app.services.mail.mail_service import mail_service
from app.helpers.mail import  generate_email_template


class UserService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.refresh_token_repo = RefreshTokenRepository()


    async def send_verification_email(self, db, email: str):
        try:

            user = await self.user_repo.get_user_by_email(db, email)

            if not user:
                raise HTTPException(status_code=400, detail="Email does not exist")

            if user.is_verified:
                raise HTTPException(status_code=400, detail="Email is already verified")

            raw_token, token_hash = generate_reset_token()

            html_body = generate_email_template(raw_token, email_type="email_verification" , username=user.username)

            await mail_service.send_email(
                subject="Verify Your Email",
                recipients=[user.email],
                body=html_body,
            )

            # Store the token hash and expiry in the database

            token = await self.user_repo.create_user_token(
                db=db,
                user_id=user.id,
                token_hash=token_hash,
                token_type="verify_email",
                expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
            )

            return token
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Error sending verification email: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to send verification email")



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

            # send mail to user for verification
            await self.send_verification_email(db, user.email)

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

    async def initiate_password_reset(self, db, email):
        try:
            user = await self.user_repo.get_user_by_email(db, email)

            if not user:
                raise HTTPException(status_code=400, detail="Email does not exist")


            raw_token , token_hash = generate_reset_token()

            html_body = generate_email_template(raw_token, "password_reset", user.username)

            await mail_service.send_email(
                subject="Password Reset Instructions",
                recipients=[user.email],
                body= html_body,
            )

            # Store the token hash and expiry in the database
            await self.user_repo.create_user_token(
                    db=db,
                    user_id=user.id,
                    token_hash=token_hash,
                    token_type="reset_password",
                    expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
            )

            return {"message": "Password reset instructions sent to your email"}

        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(e)
            raise e

    async def validate_token_and_process(
            self,
            db,
            token: str,
            token_type: Literal["reset_password", "verify_email"],
            **kwargs
    ):

        try:
            computed_hash = get_computed_hash(token)

            # Get token record
            token_record = await self.user_repo.is_valid_token(
                db,
                computed_hash,
                token_type
            )

            if not token_record:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid or expired {token_type.replace('_', ' ')} token"
                )

            if token_record.expires_at < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=400,
                    detail=f"{token_type.replace('_', ' ').title()} token has expired"
                )

            # Get user
            user = await self.user_repo.get_user_by_id(db, token_record.user_id)

            if not user:
                raise HTTPException(status_code=400, detail="User not found")

            # Process based on token type
            if token_type == "reset_password":
                new_password = kwargs.get("new_password")
                if not new_password:
                    raise HTTPException(
                        status_code=400,
                        detail="New password is required"
                    )

                # Update password
                user.password = hash_password(new_password)
                user.updated_at = datetime.now(timezone.utc)
                db.add(user)

            elif token_type == "verify_email":
                # Mark email as verified
                user.is_verified = True
                db.add(user)

            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported token type: {token_type}"
                )

            # Commit user changes
            await db.commit()
            await db.refresh(user)

            # Mark token as used
            token_record.is_used = True
            token_record.used_at = datetime.now(timezone.utc)
            db.add(token_record)
            await db.commit()
            await db.refresh(token_record)

            # Return appropriate response
            if token_type == "reset_password":
                return {
                    "user": user,
                    "message": "Password reset successful"
                }
            elif token_type == "verify_email":
                return {
                    "user": user,
                    "message": "Email verified successfully"
                }

        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"Error in validate_token_and_process: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")


    async def validate_password_reset_token(
            self,
            db,
            token: str,
            new_password: str
    ):
        """Validate password reset token and update password"""
        return await self.validate_token_and_process(
            db,
            token,
            "reset_password",
            new_password=new_password
        )

    async def validate_email_verification_token(
            self,
            db,
            token: str
    ):
        """Validate email verification token and verify email"""
        return await self.validate_token_and_process(
            db,
            token,
            "verify_email"
        )