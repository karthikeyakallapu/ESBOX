"""
Debug script to check if Telegram session exists for a user
Run this to diagnose session issues
"""
import asyncio
from sqlalchemy import select
from app.db.db import AsyncSessionLocal
from app.models import TelegramSession
from app.services.redis.RedisService import redis_service
from app.helpers.encryption import encryption

async def check_user_session(user_id: int):
    print(f"\n{'='*60}")
    print(f"🔍 Checking Telegram session for user_id: {user_id}")
    print(f"{'='*60}\n")

    # Check Redis
    redis_key = f"telegram_auth_{user_id}"
    print(f"1️⃣ Checking Redis with key: {redis_key}")
    redis_data = redis_service.get_key(redis_key, as_json=True)

    if redis_data:
        print(f"   ✅ Found in Redis!")
        print(f"   📦 Data: {redis_data}")
        session_string = redis_data.get("session_string")
        if session_string:
            print(f"   📝 Session string length: {len(session_string)} characters")
            print(f"   📝 Session string preview: {session_string[:50]}...")
        else:
            print(f"   ❌ Session string is None or empty!")
    else:
        print(f"   ⚠️  Not found in Redis")

    # Check Database
    print(f"\n2️⃣ Checking Database...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(TelegramSession).where(TelegramSession.user_id == user_id)
        )
        record = result.scalars().one_or_none()

        if record:
            print(f"   ✅ Found in Database!")
            print(f"   📦 Record ID: {record.id}")
            print(f"   📦 User ID: {record.user_id}")
            print(f"   📦 Encrypted session exists: {record.encrypted_session is not None}")

            if record.encrypted_session:
                print(f"   📝 Encrypted session length: {len(record.encrypted_session)} bytes")

                # Try to decrypt
                try:
                    session_string = encryption.decrypt(record.encrypted_session)
                    print(f"   ✅ Successfully decrypted!")
                    print(f"   📝 Decrypted session length: {len(session_string)} characters")
                    print(f"   📝 Session preview: {session_string[:50]}...")
                except Exception as e:
                    print(f"   ❌ Decryption failed: {e}")
            else:
                print(f"   ❌ Encrypted session is None!")
        else:
            print(f"   ❌ Not found in Database!")

    print(f"\n{'='*60}")
    print(f"🏁 Check complete!")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    # Change this to the user_id you want to check
    USER_ID = 1

    asyncio.run(check_user_session(USER_ID))

