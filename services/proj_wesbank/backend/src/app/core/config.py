import os
from typing import List

from loguru import logger
from pydantic import BaseSettings, Field, validator
from pydantic.networks import AnyHttpUrl

from app.core.security.secret_manager import GoogleCloudSecretSettings


ORIGINS = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:8100",
    "http://localhost:4200",
    "https://wesbank-fe-2.web.app",
    "https://wesbank.fleet-analytics.co.za",
    "https://wesbank-dev.fleet-analytics.co.za"
]


class Settings(BaseSettings):
    ENVIRONMENT: str
    # PROXY: str = 0
    TESTING: int = 0
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))

    TITLE: str = "Wesbank API"
    DESCRIPTION: str = """Your Site API ⚡"""
    VERSION: str = "1.5.0"
    TERMS_OF_SERVICE: str = "https://www.YourSite.co.za/termsandconditions.html"
    CONTACT: dict = {"url": "https://www.YourSite.co.za/#contact"}
    LICENSE_INFO: dict = {
        "name": "All rights reserved.",
        "url": "https://www.Your Site.co.za/privacypolicy.html",
    }

    ORIGINS: List[AnyHttpUrl] = ORIGINS  # type: ignore
    GOOGLE_CLOUD_PROJECT: str = 'macrocomm'
    # class Config:
    #     env_file = ".env"
    #     env_file_encoding = "utf-8"


def get_settings() -> BaseSettings:
    logger.info("Loading config settings from the environment...")
    return Settings()


settings = Settings()


# class Secrets(GoogleCloudSecretSettings):
#     project_id = os.getenv('GOOGLE_CLOUD_PROJECT')

#     POSTGRES_URL: str | None = "postgresql+psycopg2://postgres:postgres@db-local:5432/postgres"
#     @validator("POSTGRES_URL", pre=True)
#     def postgres_url_deps_env(cls, v: str) -> str:
#         if settings.ENVIRONMENT == "prod":
#             return cls.get_secret(cloud_key=f"projects/{project_id}/secrets/{'POSTGRES_URL'}/versions/latest")
#         return v

#     # GCS_MY_KEY_RESOURCE_NAME=projects/<id>/secrets/<resource-name>/versions/latest

#     AUTH0_DOMAIN: str | None = Field(
#         cloud_key=f"projects/{project_id}/secrets/{'AUTH0_DOMAIN'}/versions/latest"
#     )
#     AUTH0_API_AUDIENCE: str | None = Field(
#         cloud_key=f"projects/{project_id}/secrets/{'AUTH0_API_AUDIENCE'}/versions/latest"
#     )
#     # AUTH0_CLIENT_ID: str | None
#     # AUTH0_CLIENT_SECRET: str | None


# secrets = Secrets()
