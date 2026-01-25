from cryptography.fernet import Fernet
from app.config import settings


class SessionEncryption:
    def __init__(self):
        key = settings.session_encryption_key

        if isinstance(key, str):
            key = key.encode()

        self.cipher = Fernet(key)

    def encrypt(self, session_string: str) -> str:
        return self.cipher.encrypt(session_string.encode()).decode()

    def decrypt(self, encrypted_session: str) -> str:
        return self.cipher.decrypt(encrypted_session.encode()).decode()


encryption = SessionEncryption()
