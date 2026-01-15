from __future__ import annotations
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from src.infrastructure.config.settings import Settings

engine : Optional[AsyncEngine] = None
SessionLocal : Optional[async_sessionmaker] = None

def build_engine(settings : Settings):
    global engine
    global SessionLocal
    engine = create_async_engine(
        settings.database_url,
        echo=settings.app_debug,    # echo SQL statements in debug mode
        future=True,                # use SQLAlchemy 2.0 style
        pool_pre_ping=True,         # validates connections before using them
        pool_size=10,               # steady-state connections kept in the pool
        max_overflow=20,            # extra connections allowed above pool_size during bursts
        pool_timeout=30,            # seconds to wait before giving up getting a connection
        connect_args={
            "ssl": settings.asyncpg_ssl,
        },
    )

    SessionLocal = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
        class_=AsyncSession,
    )


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if SessionLocal is None:
        raise Exception("base has not been built")
    async with SessionLocal() as session:
        yield session

@asynccontextmanager
async def session_scope() -> AsyncGenerator[AsyncSession, None]:
    if SessionLocal is None:
        raise Exception("base has not been built")
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()