from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """
    Central application configuration loaded from environment variables.
    Uses Pydantic BaseSettings for automatic env var parsing & validation.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # MongoDB
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "leadmanagement"

    # Email (Resend)
    RESEND_API_KEY: str = "re_placeholder"
    FROM_EMAIL: str = "onboarding@resend.dev"
    FROM_NAME: str = "Lead Management System"

    # Application URLs
    API_BASE_URL: str = "http://localhost:8000"
    CLIENT_URL: str = "http://localhost:3000"
    CLICK_REDIRECT_URL: str = "https://google.com"

    # Security / JWT
    JWT_SECRET: str = "change-this-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # AI Classification
    GEMINI_API_KEY: Optional[str] = None

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10

    # App Meta
    APP_NAME: str = "Lead Management System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False


@lru_cache()
def get_settings() -> Settings:
    """Returns cached settings instance — avoids re-parsing env on every call."""
    return Settings()
