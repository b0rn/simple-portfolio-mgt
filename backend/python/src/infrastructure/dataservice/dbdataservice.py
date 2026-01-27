from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional
from src.domain.aggregates.portfolio.portfolio import Portfolio
from src.domain.aggregates.portfolio.asset import Asset
from src.domain.aggregates.health.health import Health
from src.domain.usecases.portfoliomgt.payloads import (
    PortfolioCreate,
    PortfolioUpdate,
    AssetCreate,
)
from src.infrastructure.utils.pagination import PaginationRequest, PaginationResponse


class DbDataService(ABC):
    @abstractmethod
    async def health_check(self) -> Health:
        pass

    # ----------------- Portfolio Methods -----------------
    @abstractmethod
    async def create_portfolio(
        self, owner_id: str, payload: PortfolioCreate
    ) -> Portfolio:
        pass

    @abstractmethod
    async def get_portfolio(
        self, owner_id: str, portfolio_id: int
    ) -> Optional[Portfolio]:
        pass

    @abstractmethod
    async def update_portfolio(
        self, owner_id: str, portfolio_id: int, payload: PortfolioUpdate
    ) -> Optional[Portfolio]:
        pass

    @abstractmethod
    async def delete_portfolio(self, owner_id: str, portfolio_id: int) -> bool:
        pass

    @abstractmethod
    async def list_portfolios_paginated(
        self, owner_id: str, pagination_request: PaginationRequest
    ) -> tuple[list[Portfolio], PaginationResponse]:
        pass

    # ----------------- Asset Methods -----------------
    @abstractmethod
    async def create_asset(self, portfolio_id: int, payload: AssetCreate) -> Asset:
        pass

    @abstractmethod
    async def delete_asset(self, asset_id: int) -> bool:
        pass

    @abstractmethod
    async def list_assets_paginated(
        self, portfolio_id: int, pagination_request: PaginationRequest
    ) -> tuple[list[Asset], PaginationResponse]:
        pass

    @abstractmethod
    async def list_assets(self, portfolio_id: int) -> list[Asset]:
        pass
