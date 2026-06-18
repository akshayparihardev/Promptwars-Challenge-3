"""
Centralized configuration module.

Why: All secrets and tunables live here so no controller ever imports os.environ
directly. Pydantic Settings validates presence at startup, failing fast if a
required key is missing — preventing silent runtime errors in production.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application-wide settings loaded from environment variables."""

    google_maps_api_key: str
    climatiq_api_key: str
    google_tim_api_key: str
    google_genai_api_key: str

    # Non-secret tunables
    backend_port: int = 8000
    climatiq_cache_maxsize: int = 256
    climatiq_cache_ttl: int = 3600  # seconds

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Singleton — instantiated once at import time so FastAPI dependency
# injection can reference the same object across all routes.
settings = Settings()
