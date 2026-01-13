from __future__ import annotations
from typing import Optional
from src.domain.aggregates.portfolio.portfolio import Portfolio
from src.domain.aggregates.portfolio.asset import Asset
from src.infrastructure.dataservice.dbdataservice import DbDataService
from src.infrastructure.utils.pagination import PaginationRequest, PaginationResponse
from .payloads import PortfolioCreate, PortfolioUpdate, AssetCreate

class PortfolioMgt:
    data_service : DbDataService
    
    def __init__(self, data_service: DbDataService):
        self.data_service = data_service
        
    async def health_check(self) -> bool:
        return await self.data_service.health_check()
    
    # ----------------- Portfolio Methods -----------------    
    async def create_portfolio(self, owner_id: str, payload : PortfolioCreate) -> Portfolio:
        return await self.data_service.create_portfolio(owner_id, payload)
    
    async def get_portfolio(self, owner_id: str, portfolio_id: int) -> Optional[Portfolio]:
        return await self.data_service.get_portfolio(owner_id, portfolio_id)
    
    async def update_portfolio(self, owner_id: str, portfolio_id: int, payload: PortfolioUpdate) -> Optional[Portfolio]:
        return await self.data_service.update_portfolio(owner_id=owner_id, portfolio_id=portfolio_id, payload=payload)
    
    async def delete_portfolio(self, owner_id: str, portfolio_id: int) -> bool:
        return await self.data_service.delete_portfolio(owner_id, portfolio_id)
    
    async def list_portfolios_paginated(self, owner_id: str, pagination_request: PaginationRequest) -> tuple[list[Portfolio], PaginationResponse]:
        return await self.data_service.list_portfolios_paginated(owner_id, pagination_request)
    
    # ----------------- Asset Methods -----------------
    async def create_asset(self, portfolio_id: int, payload: AssetCreate) -> Asset:
        return await self.data_service.create_asset(portfolio_id, payload)
    
    async def delete_asset(self,asset_id: int) -> bool:
        return await self.data_service.delete_asset(asset_id)
    
    async def list_assets_paginated(self, portfolio_id: int, pagination_request: PaginationRequest) -> tuple[list[Asset], PaginationResponse]:
        return await self.data_service.list_assets_paginated(portfolio_id, pagination_request)
    

