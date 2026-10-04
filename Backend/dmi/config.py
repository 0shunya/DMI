from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./dmi.db"
    redis_url: str = ""
    secret_key: str = "local-development-only-change-before-deploy"
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    scrape_interval_seconds: int = 21600
    ollama_url: str = ""
    ollama_model: str = "gemma3:1b"
    frontend_url: str = "http://localhost:5173"
    email_provider: str = "log"
    resend_api_key: str = ""
    email_from: str = "DMI <onboarding@resend.dev>"
    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""

    @property
    def origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.environment == "production" and (
        len(settings.secret_key) < 32
        or settings.secret_key == "local-development-only-change-before-deploy"
    ):
        raise RuntimeError("SECRET_KEY must be a unique random value of at least 32 characters")
    return settings
