"""
Unit tests for settings validation and configuration.
"""
from __future__ import annotations

import pytest
from pydantic import ValidationError

from src.infrastructure.config.settings import build_settings
import os


@pytest.mark.unit
class TestSettings:
    """Test settings validation and properties."""

    def test_default_settings(self, monkeypatch):
        """Test that default settings work."""
        # Use a test env file that doesn't exist to use defaults
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        # Clear any existing env vars that might interfere
        monkeypatch.delenv("APP_NAME", raising=False)
        monkeypatch.delenv("APP_ENV", raising=False)
        monkeypatch.delenv("APP_DEBUG", raising=False)
        monkeypatch.delenv("DB_HOST", raising=False)
        monkeypatch.delenv("DB_NAME", raising=False)
        monkeypatch.delenv("DB_USER", raising=False)
        monkeypatch.delenv("CORS_ORIGINS", raising=False)
        monkeypatch.delenv("AUTH_MODE", raising=False)
        # monkeypatch.delenv("JWT_SECRET", raising=False)
        monkeypatch.delenv("JWT_EXPIRES_MINUTES", raising=False)
        monkeypatch.delenv("COOKIE_SECURE", raising=False)
        monkeypatch.delenv("COOKIE_SAMESITE", raising=False)
        monkeypatch.delenv("COOKIE_DOMAIN", raising=False)
        monkeypatch.delenv("SUPABASE_URL", raising=False)
        monkeypatch.delenv("SUPABASE_ANON_KEY", raising=False)
        monkeypatch.setenv("JWT_SECRET", "foobar")
        settings = build_settings()
        assert settings.app_name == "Simple Portfolio App API"
        assert settings.app_env == "dev"
        assert settings.app_debug is False
        assert settings.db_host == "localhost"
        assert settings.db_port == 5432
        assert settings.db_name == "portfolio_db"
        assert settings.cors_origins == ["http://localhost:3000"]
        assert settings.auth_mode == "local"
        assert settings.jwt_secret == "foobar"
        assert settings.jwt_expires_minutes == 60
        assert settings.cookie_secure is False
        assert settings.cookie_samesite == "lax"
        assert settings.cookie_domain is None
        assert settings.supabase_url is None
        assert settings.supabase_anon_key is None

    def test_database_url_property(self, monkeypatch):
        """Test database_url property construction."""
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        monkeypatch.setenv("JWT_SECRET", "foobar")
        monkeypatch.setenv("DB_USER", "testuser")
        monkeypatch.setenv("DB_PASSWORD", "test@pass#word")
        monkeypatch.setenv("DB_HOST", "db.example.com")
        monkeypatch.setenv("DB_PORT", "5433")
        monkeypatch.setenv("DB_NAME", "testdb")

        settings = build_settings()
        url = settings.database_url
        assert "testuser" in url
        assert "test%40pass%23word" in url  # URL encoded
        assert "db.example.com" in url
        assert "5433" in url
        assert "testdb" in url
        assert url.startswith("postgresql+asyncpg://")

    def test_asyncpg_ssl_property(self, monkeypatch):
        """Test asyncpg_ssl property mapping."""
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        monkeypatch.setenv("JWT_SECRET", "foobar")

        # Test "require" -> True
        monkeypatch.setenv("DB_SSLMODE", "require")
        settings = build_settings()
        assert settings.asyncpg_ssl is True

        # Test "prefer" -> True
        monkeypatch.setenv("DB_SSLMODE", "prefer")
        settings = build_settings()
        assert settings.asyncpg_ssl is True

        # Test "disable" -> False
        monkeypatch.setenv("DB_SSLMODE", "disable")
        settings = build_settings()
        assert settings.asyncpg_ssl is False

        # Test "allow" -> False
        monkeypatch.setenv("DB_SSLMODE", "allow")
        settings = build_settings()
        assert settings.asyncpg_ssl is False

    def test_validate_db_host_empty(self, monkeypatch):
        """Test that empty DB_HOST raises ValidationError."""
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        monkeypatch.setenv("DB_HOST", "")
        with pytest.raises(ValidationError) as exc_info:
            build_settings()
        errors = exc_info.value.errors()
        assert any("DB_HOST" in str(err.get("loc", [])) for err in errors)

    def test_validate_db_name_empty(self, monkeypatch):
        """Test that empty DB_NAME raises ValidationError."""
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        monkeypatch.setenv("DB_NAME", "")
        with pytest.raises(ValidationError) as exc_info:
            build_settings()
        errors = exc_info.value.errors()
        assert any("DB_NAME" in str(err.get("loc", [])) for err in errors)

    def test_validate_db_user_empty(self, monkeypatch):
        """Test that empty DB_USER raises ValidationError."""
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        monkeypatch.setenv("DB_USER", "")
        with pytest.raises(ValidationError) as exc_info:
            build_settings()
        errors = exc_info.value.errors()
        assert any("DB_USER" in str(err.get("loc", [])) for err in errors)

    def test_validate_db_port_range(self, monkeypatch):
        """Test that DB_PORT validation enforces valid range."""
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        monkeypatch.setenv("JWT_SECRET", "foobar")

        # Test too low
        monkeypatch.setenv("DB_PORT", "0")
        with pytest.raises(ValidationError):
            build_settings()

        # Test too high
        monkeypatch.setenv("DB_PORT", "65536")
        with pytest.raises(ValidationError):
            build_settings()

        # Test valid ports
        monkeypatch.setenv("DB_PORT", "1")
        settings = build_settings()
        assert settings.db_port == 1

        monkeypatch.setenv("DB_PORT", "65535")
        settings = build_settings()
        assert settings.db_port == 65535

    def test_validate_db_sslmode_invalid(self, monkeypatch):
        """Test that invalid DB_SSLMODE raises ValidationError."""
        monkeypatch.setenv("ENV_FILE", "/nonexistent/.env")
        monkeypatch.setenv("DB_SSLMODE", "invalid")
        with pytest.raises(ValidationError) as exc_info:
            build_settings()
        errors = exc_info.value.errors()
        assert any("DB_SSLMODE" in str(err.get("loc", [])) for err in errors)
