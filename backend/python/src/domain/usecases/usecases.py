from __future__ import annotations
from dataclasses import dataclass

from src.infrastructure.config.settings import Settings
from .authmgt.authmgt import AuthMgt
from .portfoliomgt.portfoliomgt import PortfolioMgt
from src.infrastructure.dataservice.authdataservice_builder import (
    build_auth_dataservice,
)
from src.infrastructure.dataservice.dbdataservice_builder import build_db_dataservice


@dataclass(frozen=True)
class UseCases:
    auth_mgt: AuthMgt
    portfolio_mgt: PortfolioMgt

    @staticmethod
    def build(settings: Settings) -> UseCases:
        # Build dataservices here if we have to share them
        auth_dataservice = build_auth_dataservice(settings=settings)
        db_dataservice = build_db_dataservice(settings=settings)
        auth_uc = AuthMgt(auth_data_service=auth_dataservice)
        portfolio_uc = PortfolioMgt(data_service=db_dataservice)
        return UseCases(auth_mgt=auth_uc, portfolio_mgt=portfolio_uc)
