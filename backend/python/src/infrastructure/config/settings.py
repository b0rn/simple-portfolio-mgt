from __future__ import annotations

import os
from urllib.parse import quote_plus
from typing import Literal
from pydantic import Field,field_validator,model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SameSite = Literal["lax", "strict", "none"]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = Field(default="Simple Portfolio App API", alias="APP_NAME")
    app_env: str = Field(default="dev", alias="APP_ENV")
    app_debug: bool = Field(default=False, alias="APP_DEBUG")

    # Database (REQUIRED)
    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=5432, alias="DB_PORT")
    db_name: str = Field(default="portfolio_db", alias="DB_NAME")
    db_user: str = Field(default="postgres", alias="DB_USER")
    db_password: str = Field(default="postgres", alias="DB_PASSWORD")
    db_sslmode: str = Field(default="prefer", alias="DB_SSLMODE")

    # CORS
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")

    # Auth
    auth_mode: str = Field(default="local", alias="AUTH_MODE")  # "local" | "supabase"
    jwt_secret: str | None = Field(default=None, alias="JWT_SECRET")
    jwt_expires_minutes: int = Field(default=60, alias="JWT_EXPIRES_MINUTES")
    cookie_secure: bool = Field(default=False, alias="COOKIE_SECURE")
    cookie_samesite: SameSite = Field(default="lax", alias="COOKIE_SAMESITE")  # lax|strict|none
    cookie_domain: str | None = Field(default=None, alias="COOKIE_DOMAIN")
    # Supabase (required if auth_mode == "supabase")
    supabase_url: str | None = Field(default=None, alias="SUPABASE_URL")
    supabase_anon_key: str | None = Field(default=None, alias="SUPABASE_ANON_KEY")

    # -------------------------
    # Validators
    # -------------------------
    @field_validator("db_host")
    @classmethod
    def validate_host(cls, v: str) -> str:
        if not v:
            raise ValueError("DB_HOST must not be empty")
        return v
    
    @field_validator("db_name")
    @classmethod
    def validate_db_name(cls, v: str) -> str:   
        if not v:
            raise ValueError("DB_NAME must not be empty")
        return v
    
    @field_validator("db_user")
    @classmethod
    def validate_user(cls, v: str) -> str:
        if not v:
            raise ValueError("DB_USER must not be empty")
        return v
    
    @field_validator("db_port")
    @classmethod
    def validate_port(cls, v: int) -> int:
        if not (1 <= v <= 65535):
            raise ValueError("DB_PORT must be between 1 and 65535")
        return v

    @field_validator("db_sslmode")
    @classmethod
    def validate_sslmode(cls, v: str) -> str:
        allowed = {"disable", "allow", "prefer", "require"}
        if v not in allowed:
            raise ValueError(f"DB_SSLMODE must be one of {allowed}")
        return v

    @property
    def database_url(self) -> str:
        encoded_password = quote_plus(self.db_password)
        return (
            f"postgresql+asyncpg://{self.db_user}:{encoded_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def asyncpg_ssl(self) -> bool:
        """
        asyncpg does NOT support sslmode.
        We map it to a boolean:
        """
        return self.db_sslmode in {"require", "prefer"}

    @property
    def cors_origins(self) -> list[str]:
        # comma-separated -> list, trimmed, no empties
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]


    @field_validator("cookie_samesite")
    @classmethod
    def validate_samesite(cls, v: str) -> str:
        allowed = {"lax", "strict", "none"}
        v = v.lower()
        if v not in allowed:
            raise ValueError(f"COOKIE_SAMESITE must be one of {allowed}")
        return v

    @model_validator(mode="after")
    def validate_auth_requirements(self) -> "Settings":
        mode = (self.auth_mode or "").lower()
        if mode not in {"local", "supabase"}:
            raise ValueError("AUTH_MODE must be 'local' or 'supabase'")

        if mode == "local":
            if not self.jwt_secret:
                raise ValueError("JWT_SECRET is required when AUTH_MODE=local")
        else:
            if not self.supabase_url or not self.supabase_anon_key:
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY are required when AUTH_MODE=supabase")

        # If SameSite=None, cookies must be Secure in modern browsers
        if self.cookie_samesite == "none" and not self.cookie_secure:
            raise ValueError("If COOKIE_SAMESITE=none then COOKIE_SECURE must be true")

        return self


def build_settings():
    env_file = os.getenv("ENV_FILE", ".env")
    return Settings(_env_file=env_file) # type: ignore[call-arg]