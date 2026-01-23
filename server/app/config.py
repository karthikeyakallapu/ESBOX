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


settings = Settings()
