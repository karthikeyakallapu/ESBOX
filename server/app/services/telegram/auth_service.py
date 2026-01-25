from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError, PhoneCodeInvalidError
from telethon.sessions import StringSession

from app.config import settings
from app.helpers.encryption import encryption
from app.logger import logger
from app.models import TelegramSession
from app.services.redis.RedisService import redis_service


class TelegramAuthService:
    def __init__(self, user_id: int, db: AsyncSession):
        self.user_id = user_id
        self.db = db
        self.api_id = settings.telegram_api_id
        self.api_hash = settings.telegram_api_hash
        self.client: Optional[TelegramClient] = None

    async def phone_authenticate(self, phone: str, ip_address: str):
        try:

            self.client = TelegramClient(
                StringSession(),  # Empty session
                self.api_id,
                self.api_hash
            )

            await self.client.connect()

            sent_code = await self.client.send_code_request(phone)

            session_key = f"telegram_auth_{self.user_id}"

            session_value = {
                'phone_number': phone,
                'phone_code_hash': sent_code.phone_code_hash,
                'client_session': self.client.session.save(),
                "ip_address": ip_address
            }

            redis_service.set_key(session_key, session_value, 300)

            return {
                'success': True,
                'message': 'Verification code sent to your Telegram app',
                'phone_code_hash': sent_code.phone_code_hash
            }

        except Exception as e:
            logger.error(e)
            raise e

    async def verify_phone_code(self, code: int | str):

        try:
            session_key = f"telegram_auth_{self.user_id}"

            session_data = redis_service.get_key(session_key, as_json=True)

            if not session_data:
                return {'success': False, 'error': 'Session expired. Please start again.'}

            self.client = TelegramClient(
                StringSession(session_data['client_session']),
                self.api_id,
                self.api_hash
            )

            await self.client.connect()

            # Sign in with code
            await self.client.sign_in(
                phone=session_data["phone_number"],
                code=code,
                phone_code_hash=session_data["phone_code_hash"]
            )

            # Success! Save session
            result = await self._save_authenticated_session()

            return result

        except SessionPasswordNeededError:
            return {
                'success': False,
                'requires_2fa': True,
                'message': 'Please enter your 2FA password'
            }

        except PhoneCodeInvalidError:
            return {
                'success': False,
                'error': 'Invalid verification code. Please try again.'
            }

        except Exception as e:
            logger.error(e)
            raise e

    async def _save_authenticated_session(self):

        try:
            me = await self.client.get_me()

            # Encrypt and save session
            session_string = self.client.session.save()
            encrypted_session = encryption.encrypt(session_string)

            result = await self.db.execute(
                select(TelegramSession).where(TelegramSession.user_id == self.user_id)
            )

            existing = result.scalar_one_or_none()

            if existing:
                existing.encrypted_session = encrypted_session
                existing.telegram_user_id = me.id
                existing.phone_number = me.phone or ''
                existing.first_name = me.first_name or ''
                existing.last_name = me.last_name or ''
                existing.username = me.username
                existing.is_active = True
            else:
                telegram_session = TelegramSession(
                    user_id=self.user_id,
                    encrypted_session=encrypted_session,
                    telegram_user_id=me.id,
                    phone_number=me.phone or '',
                    first_name=me.first_name or '',
                    last_name=me.last_name or '',
                    username=me.username,
                    is_active=True
                )

                self.db.add(telegram_session)

            await self.db.commit()

            return {
                'success': True,
                'message': 'Successfully connected to Telegram!',
                'telegram_user': {
                    'id': me.id,
                    'name': f"{me.first_name or ''} {me.last_name or ''}".strip(),
                    'username': me.username,
                    'phone': me.phone
                }
            }

        except Exception as e:
            await self.db.rollback()
            logger.error(e)
            raise e
