from __future__ import annotations

from src.infrastructure.config.settings import Settings
from src.infrastructure.datastore.sqlalchemy.base import build_engine

from .db_sqlalchemy.sqlalchemy import SQLAlchemyDataService
from .dbdataservice import DbDataService


def build_db_dataservice(settings: Settings) -> DbDataService:
    build_engine(settings=settings)
    return SQLAlchemyDataService()
