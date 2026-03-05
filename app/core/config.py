from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    app_name: str = "Delinoapp Products"
    app_version: str = "1.0.0"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # CORS settings
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Database settings
    DATABASE_URL: str = "postgresql+psycopg://delinoapp:delinoapp@localhost:5432/delinoapp"
    DEBUG: bool = False

    # External data source (DummyJSON)
    dummyjson_base_url: str = "https://dummyjson.com"

    # Scheduler settings
    product_refresh_hours: int = 6
    scheduler_enabled: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
