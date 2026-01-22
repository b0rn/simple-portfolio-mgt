from __future__ import annotations

import argparse
import asyncio
import sys

from sqlalchemy.ext.asyncio import create_async_engine

from src.infrastructure.config.settings import build_settings
from src.infrastructure.datastore.sqlalchemy.base import Base
import src.infrastructure.datastore.sqlalchemy.models

# ---------- helpers ----------


def _require_db_settings() -> None:
    if settings is None:
        raise Exception("settings is not set")
    missing = [
        name for name, value in {
            "DB_HOST": settings.db_host,
            "DB_PORT": settings.db_port,
            "DB_USER": settings.db_user,
            "DB_PASSWORD": settings.db_password,
            "DB_NAME": settings.db_name,
        }.items()
        if not value
    ]

    if missing:
        print(f"Missing DB env vars: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)


async def _create_tables() -> None:
    if settings is None:
        raise Exception("settings is not set")
    engine = create_async_engine(settings.database_url)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("Tables created")


async def _drop_tables() -> None:
    if settings is None:
        raise Exception("settings is not set")
    engine = create_async_engine(settings.database_url)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()
    print("Tables dropped")


# ---------- main ----------

def main() -> None:
    parser = argparse.ArgumentParser(description="Database management CLI")

    parser.add_argument("--drop-tables", action="store_true", help="Drop all tables")
    parser.add_argument("--create-tables", action="store_true", help="Create all tables")

    args = parser.parse_args()

    if not any(vars(args).values()):
        parser.print_help()
        sys.exit(0)

    _require_db_settings()

    if not Base.metadata.tables:
        raise RuntimeError("No SQLAlchemy models registered")

    async def run():
        if args.drop_tables:
            await _drop_tables()

        if args.create_tables:
            await _create_tables()

    asyncio.run(run())


if __name__ == "__main__":
    settings = build_settings()
    main()
