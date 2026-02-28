from typing import List, Union

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    title: str
    version: str

    # server config
    host: str
    port: int
    environment: str

    # logging
    log_level: str

    # database
    database_url: str

    # JWT Config
    access_token_secret: str
    refresh_token_secret: str
    algorithm: str

    # Telegram Auth
    telegram_api_id: str
    telegram_api_hash: str
    session_encryption_key: str

    # Redis Configuration
    redis_host: str
    redis_port: int

    # File Upload Limit Config - MAXIMUM SPEED MODE
    max_file_size: int = 2 * 1024 * 1024 * 1024
    max_concurrent_uploads: int = 10
    chunk_size: int = 1024 * 1024

    allowed_origins: Union[str, List[str]]

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def split_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

settings = Settings()
