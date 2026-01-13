"""
Shared test fixtures for unit and integration tests.
"""
from __future__ import annotations

import os
import pytest
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from httpx import ASGITransport, AsyncClient

from src.database import Base, get_db
import src.main
from src.main import app


# Test database URL - using SQLite in-memory for faster tests
# Can be overridden with TEST_DATABASE_URL environment variable
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "sqlite+aiosqlite:///:memory:"
)

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in TEST_DATABASE_URL else {},
    poolclass=StaticPool if "sqlite" in TEST_DATABASE_URL else None,
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for each test.
    Creates and drops all tables before/after each test.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an async test client for FastAPI.
    This is the preferred client for testing async endpoints.
    """
    async def _get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session
    
    app.dependency_overrides[get_db] = _get_db
    
    # Override the engine in main module for health check endpoint
    # The health endpoint uses engine.connect() directly, so we need to patch it
    
    original_engine = src.main.engine
    src.main.engine = test_engine
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    
    # Cleanup
    app.dependency_overrides.clear()
    src.main.engine = original_engine


@pytest.fixture
def mock_db_session():
    """
    Create a mock database session for unit tests.
    """
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

