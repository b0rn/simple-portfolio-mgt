"""
Shared test fixtures for unit and integration tests.
"""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock

from sqlalchemy.ext.asyncio import (
    AsyncSession,
)
from httpx import ASGITransport, AsyncClient, MockTransport, Request, Response
from uuid import uuid4
from datetime import datetime, timezone
import json

from src.infrastructure.config.settings import build_settings
from src.infrastructure.dataservice.dbdataservice import DbDataService
from src.infrastructure.dataservice.authdataservice import AuthDataService
from src.infrastructure.dataservice.db_sqlalchemy.sqlalchemy import (
    SQLAlchemyDataService,
)
from src.infrastructure.dataservice.auth_local.local import LocalAuthDataService
from src.infrastructure.dataservice.auth_supabase.supabase import (
    SupabaseAuthDataService,
)
from src.infrastructure.datastore.sqlalchemy.base import build_engine
from src.api.rest.app import create_app
from src.domain.usecases.usecases import UseCases
from src.domain.usecases.authmgt.authmgt import AuthMgt
from src.domain.usecases.portfoliomgt.portfoliomgt import PortfolioMgt


@pytest.fixture
def dataservice_db_sqlalchemy() -> DbDataService:
    build_engine(settings=build_settings())
    return SQLAlchemyDataService()


@pytest.fixture
def dataservice_auth_local():
    settings = build_settings()
    build_engine(settings=settings)
    return LocalAuthDataService(settings=settings)


@pytest.fixture
async def dataservice_auth_local_user(dataservice_auth_local: LocalAuthDataService):
    email = f"test-{uuid4()}@test.com"
    password = "password123!"
    user, token = await dataservice_auth_local.register(email, password)

    yield user, password, token

    await dataservice_auth_local.delete_user(email)


@pytest.fixture
def dataservice_auth_supabase():
    access_token = "my_access_token"
    id = uuid4()
    email = "foo@bar.com"
    created_at = datetime.now(tz=timezone.utc)

    async def handler(request: Request):
        contents = request.content.decode()
        body = {}
        if contents:
            body = json.loads(contents)
        if request.url.path == "/auth/v1/signup":
            # Register
            if body["email"] == "400":
                return Response(status_code=400)
            elif body["email"] == "no_access_token":
                return Response(status_code=201, json={})
            return Response(status_code=201, json={"access_token": access_token})
        elif request.url.path == "/auth/v1/user":
            # Get user from token
            token = request.headers.get("Authorization")
            if "400" in token:
                return Response(status_code=400)
            return Response(
                status_code=200,
                json={
                    "id": str(id),
                    "email": email,
                    "created_at": created_at.isoformat(),
                },
            )
        elif request.url.path == "/auth/v1/token":
            # Login
            if body["email"] == "400":
                return Response(status_code=400)
            elif body["email"] == "no_access_token":
                return Response(status_code=200, json={})
            return Response(status_code=200, json={"access_token": access_token})
        return Response(status_code=404)

    client = AsyncClient(transport=MockTransport(handler=handler))
    ds = SupabaseAuthDataService(settings=build_settings(), client=client)
    ds._settings.supabase_url = "https://test.com"
    ds._settings.supabase_anon_key = "anonkey"
    yield ds, access_token, id, email, created_at


@pytest.fixture
def mock_auth_uc():
    uc = AsyncMock(spec=AuthMgt)
    uc.health_check = AsyncMock()
    uc.register = AsyncMock()
    uc.login = AsyncMock()
    uc.get_user_from_token = AsyncMock()
    return uc


@pytest.fixture
def mock_portfolio_mgt():
    uc = AsyncMock(spec=PortfolioMgt)
    uc.health_check = AsyncMock()
    uc.get_assets_prices = MagicMock()
    uc.create_portfolio = AsyncMock()
    uc.get_portfolio = AsyncMock()
    uc.update_portfolio = AsyncMock()
    uc.delete_portfolio = AsyncMock()
    uc.list_portfolios_paginated = AsyncMock()
    uc.compute_portfolio_valuation = AsyncMock()
    uc.create_asset = AsyncMock()
    uc.delete_asset = AsyncMock()
    uc.list_assets_paginated = AsyncMock()
    return uc


@pytest.fixture
async def rest_client(mock_auth_uc: AuthMgt, mock_portfolio_mgt: PortfolioMgt):
    ucs = UseCases(auth_mgt=mock_auth_uc, portfolio_mgt=mock_portfolio_mgt)
    app = create_app(settings=build_settings(), usecases=ucs)
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        cookies={"access_token": "token"},
    ) as ac:
        yield ac, mock_auth_uc, mock_portfolio_mgt


@pytest.fixture
def mock_db_session():
    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.scalar = AsyncMock()
    session.scalars = MagicMock()
    session.add = MagicMock()
    session.commit = AsyncMock()
    session.refresh = AsyncMock()
    session.delete = MagicMock()
    session.rollback = AsyncMock()
    return session


@pytest.fixture
def mock_db_dataservice():
    db_dataservice = AsyncMock(spec=DbDataService)
    db_dataservice.health_check = AsyncMock()
    db_dataservice.create_portfolio = AsyncMock()
    db_dataservice.update_portfolio = AsyncMock()
    db_dataservice.delete_portfolio = AsyncMock()
    db_dataservice.list_portfolios_paginated = AsyncMock()
    db_dataservice.create_asset = AsyncMock()
    db_dataservice.delete_asset = AsyncMock()
    db_dataservice.list_assets_paginated = AsyncMock()
    db_dataservice.list_assets = AsyncMock()
    return db_dataservice


@pytest.fixture
def mock_auth_dataservice():
    auth_ds = AsyncMock(spec=AuthDataService)
    auth_ds.health_check = AsyncMock()
    auth_ds.register = AsyncMock()
    auth_ds.login = AsyncMock()
    auth_ds.get_user_from_token = AsyncMock()
    return auth_ds
