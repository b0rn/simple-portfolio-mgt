from __future__ import annotations
from .dbdataservice import DbDataService
from .db_sqlalchemy.sqlalchemy import SQLAlchemyDataService

def build_db_dataservice() -> DbDataService:
    return SQLAlchemyDataService()