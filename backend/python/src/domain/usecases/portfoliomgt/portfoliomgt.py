from __future__ import annotations
from typing import Optional
from cachetools import TTLCache
from src.domain.aggregates.portfolio.portfolio import Portfolio
from src.domain.aggregates.portfolio.asset import Asset
from src.domain.aggregates.portfolio.portfolio_valuation import (
    PortfolioValuation,
    ValuationLine,
)
from src.domain.aggregates.health.health import Health
from src.infrastructure.dataservice.dbdataservice import DbDataService
from src.infrastructure.utils.pagination import PaginationRequest, PaginationResponse
from .payloads import PortfolioCreate, PortfolioUpdate, AssetCreate

ASSET_PRICES_USD = {
    "ETH": 3191.30,
    "BTC": 93556.62,
    "MSFT": 467.71,
    "NVDA": 184.82,
    "AAPL": 260.18,
}


class PortfolioMgt:
    data_service: DbDataService

    def __init__(self, data_service: DbDataService):
        self.data_service = data_service
        self.valuation_cache = TTLCache(maxsize=10_000, ttl=30)

    async def health_check(self) -> Health:
        return await self.data_service.health_check()

    def get_assets_prices(self) -> dict[str, float]:
        return ASSET_PRICES_USD

    # ----------------- Portfolio Methods -----------------
    async def create_portfolio(
        self, owner_id: str, payload: PortfolioCreate
    ) -> Portfolio:
        return await self.data_service.create_portfolio(owner_id, payload)

    async def get_portfolio(
        self, owner_id: str, portfolio_id: int
    ) -> Optional[Portfolio]:
        return await self.data_service.get_portfolio(owner_id, portfolio_id)

    async def update_portfolio(
        self, owner_id: str, portfolio_id: int, payload: PortfolioUpdate
    ) -> Optional[Portfolio]:
        return await self.data_service.update_portfolio(
            owner_id=owner_id, portfolio_id=portfolio_id, payload=payload
        )

    async def delete_portfolio(self, owner_id: str, portfolio_id: int) -> bool:
        return await self.data_service.delete_portfolio(owner_id, portfolio_id)

    async def list_portfolios_paginated(
        self, owner_id: str, pagination_request: PaginationRequest
    ) -> tuple[list[Portfolio], PaginationResponse]:
        return await self.data_service.list_portfolios_paginated(
            owner_id, pagination_request
        )

    async def compute_portfolio_valuation(
        self, portfolio_id: int
    ) -> PortfolioValuation:
        # Check if it's cached
        cache_key = f"valuation:{portfolio_id}"
        value = self.valuation_cache.get(cache_key)
        if value is not None:
            return value

        assets = await self.data_service.list_assets(portfolio_id=portfolio_id)
        total = 0.0
        unkown_symbols = []
        valuation_lines = []
        for a in assets:
            symbol = a.symbol.upper().strip()
            asset_price = ASSET_PRICES_USD.get(symbol)
            if asset_price is not None:
                valuation = a.quantity * asset_price
                valuation_lines.append(
                    ValuationLine(
                        symbol=a.symbol,
                        quantity=a.quantity,
                        price=asset_price,
                        value=valuation,
                    )
                )
                total += valuation
            else:
                unkown_symbols.append(symbol)
        value = PortfolioValuation(
            portfolio_id=portfolio_id,
            total_value=total,
            lines=valuation_lines,
            unknown_symbols=sorted(list(set(unkown_symbols))),
        )
        self.valuation_cache[cache_key] = value
        return value

    # ----------------- Asset Methods -----------------
    async def create_asset(self, portfolio_id: int, payload: AssetCreate) -> Asset:
        return await self.data_service.create_asset(portfolio_id, payload)

    async def delete_asset(self, asset_id: int) -> bool:
        return await self.data_service.delete_asset(asset_id)

    async def list_assets_paginated(
        self, portfolio_id: int, pagination_request: PaginationRequest
    ) -> tuple[list[Asset], PaginationResponse]:
        return await self.data_service.list_assets_paginated(
            portfolio_id, pagination_request
        )
