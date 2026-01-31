"""
Unit tests for infrastructure components to improve code coverage.
"""

from __future__ import annotations

import pytest
from unittest.mock import MagicMock, AsyncMock

from src.infrastructure.config.exceptions import SettingsNotSetError
from src.infrastructure.config.settings import build_settings


# ----------------------- SettingsNotSetError -----------------------


class TestSettingsNotSetError:
    def test_default_message(self):
        err = SettingsNotSetError()
        assert str(err) == "Required settings are not set"

    def test_custom_message(self):
        err = SettingsNotSetError("custom msg")
        assert str(err) == "custom msg"


# ----------------------- AuthDataService Builder -----------------------


class TestAuthDataServiceBuilder:
    def test_build_local(self):
        from src.infrastructure.dataservice.authdataservice_builder import (
            build_auth_dataservice,
        )
        from src.infrastructure.dataservice.auth_local.local import LocalAuthDataService

        settings = build_settings()
        settings.auth_mode = "local"
        ds = build_auth_dataservice(settings=settings)
        assert isinstance(ds, LocalAuthDataService)

    def test_build_supabase(self):
        from src.infrastructure.dataservice.authdataservice_builder import (
            build_auth_dataservice,
        )
        from src.infrastructure.dataservice.auth_supabase.supabase import (
            SupabaseAuthDataService,
        )

        settings = build_settings()
        settings.auth_mode = "supabase"
        ds = build_auth_dataservice(settings=settings)
        assert isinstance(ds, SupabaseAuthDataService)


# ----------------------- DbDataService Builder -----------------------


class TestDbDataServiceBuilder:
    def test_build(self):
        from src.infrastructure.dataservice.dbdataservice_builder import (
            build_db_dataservice,
        )
        from src.infrastructure.dataservice.db_sqlalchemy.sqlalchemy import (
            SQLAlchemyDataService,
        )

        settings = build_settings()
        ds = build_db_dataservice(settings=settings)
        assert isinstance(ds, SQLAlchemyDataService)


# ----------------------- UseCases.build -----------------------


class TestUseCasesBuild:
    def test_build(self):
        from src.domain.usecases.usecases import UseCases
        from src.domain.usecases.authmgt.authmgt import AuthMgt
        from src.domain.usecases.portfoliomgt.portfoliomgt import PortfolioMgt

        settings = build_settings()
        ucs = UseCases.build(settings=settings)
        assert isinstance(ucs.auth_mgt, AuthMgt)
        assert isinstance(ucs.portfolio_mgt, PortfolioMgt)


# ----------------------- SQLAlchemy base -----------------------


@pytest.mark.asyncio
class TestSQLAlchemyBase:
    def test_set_engine(self):
        from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
        from src.infrastructure.datastore.sqlalchemy.base import set_engine

        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        session_maker = set_engine(engine)
        assert isinstance(session_maker, async_sessionmaker)

    async def test_get_db_happy_path(self):
        from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
        from src.infrastructure.datastore.sqlalchemy.base import set_engine, get_db

        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        set_engine(engine)
        gen = get_db()
        session = await gen.__anext__()
        assert isinstance(session, AsyncSession)
        try:
            await gen.__anext__()
        except StopAsyncIteration:
            pass

    async def test_get_db_not_built(self):
        import src.infrastructure.datastore.sqlalchemy.base as base_mod

        original = base_mod.SessionLocal
        base_mod.SessionLocal = None
        try:
            gen = base_mod.get_db()
            with pytest.raises(Exception, match="base has not been built"):
                await gen.__anext__()
        finally:
            base_mod.SessionLocal = original

    async def test_session_scope_not_built(self):
        import src.infrastructure.datastore.sqlalchemy.base as base_mod

        original = base_mod.SessionLocal
        base_mod.SessionLocal = None
        try:
            with pytest.raises(Exception, match="base has not been built"):
                async with base_mod.session_scope():
                    pass
        finally:
            base_mod.SessionLocal = original

    async def test_session_scope_rollback_on_error(self):
        import src.infrastructure.datastore.sqlalchemy.base as base_mod

        mock_session = AsyncMock()
        mock_session.rollback = AsyncMock()
        mock_session.close = AsyncMock()

        mock_session_maker = MagicMock()
        mock_ctx = AsyncMock()
        mock_ctx.__aenter__ = AsyncMock(return_value=mock_session)
        mock_ctx.__aexit__ = AsyncMock(return_value=False)
        mock_session_maker.return_value = mock_ctx

        original = base_mod.SessionLocal
        base_mod.SessionLocal = mock_session_maker
        try:
            with pytest.raises(ValueError):
                async with base_mod.session_scope() as _:
                    raise ValueError("test error")
        finally:
            base_mod.SessionLocal = original


# ----------------------- Supabase exceptions -----------------------


class TestSupabaseExceptions:
    def test_all_exceptions_instantiate(self):
        from src.infrastructure.dataservice.auth_supabase.exceptions import (
            SupabaseAuthError,
            SupabaseUrlNotSetError,
            AnonKeyNotSetError,
            EmailConfirmationRequiredError,
            NoAccessTokenError,
            TokenInvalidError,
            CantFetchUserError,
            SignupFailedError,
        )

        assert isinstance(SupabaseUrlNotSetError(), SupabaseAuthError)
        assert isinstance(AnonKeyNotSetError(), SupabaseAuthError)
        assert isinstance(EmailConfirmationRequiredError(), SupabaseAuthError)
        assert isinstance(NoAccessTokenError(), SupabaseAuthError)
        assert isinstance(TokenInvalidError(), SupabaseAuthError)
        assert isinstance(CantFetchUserError(), SupabaseAuthError)
        assert isinstance(SignupFailedError(), SupabaseAuthError)
