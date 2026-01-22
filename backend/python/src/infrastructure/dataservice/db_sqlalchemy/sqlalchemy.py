from __future__ import annotations
from typing import Optional
from sqlalchemy import select,update,delete, func
from src.domain.aggregates.portfolio.portfolio import Portfolio
from src.domain.aggregates.portfolio.asset import Asset
from src.domain.aggregates.health.health import Health
from src.domain.usecases.portfoliomgt.payloads import PortfolioCreate, PortfolioUpdate, AssetCreate
from src.infrastructure.dataservice.dbdataservice import DbDataService
from src.infrastructure.datastore.sqlalchemy.models.portfolio import Portfolio as PortfolioModel
from src.infrastructure.datastore.sqlalchemy.models.asset import Asset as AssetModel
from src.infrastructure.datastore.sqlalchemy.base import session_scope
from src.infrastructure.utils.pagination import PaginationRequest, create_pagination_response

class SQLAlchemyDataService(DbDataService):    
    
    async def health_check(self) -> Health:
        errors : list[str] = []
        warnings : list[str] = []
        async with session_scope() as db:
            try:
                await db.execute(select(PortfolioModel).limit(1))
                return Health(errors=errors, warnings=warnings)
            except Exception:
                errors.append("could not connect to database")
                return Health(errors, warnings=warnings)
    
    # ----------------- Portfolio Methods -----------------    
    async def create_portfolio(self, owner_id: str, payload: PortfolioCreate) -> Portfolio:
        model = PortfolioModel(name=payload.name,owner_id=owner_id)
        async with session_scope() as db:
            db.add(model)
            await db.commit()
            await db.refresh(model)
        return Portfolio(id=model.id, owner_id=model.owner_id, name=model.name, created_at=model.created_at)

    async def get_portfolio(self, owner_id: str, portfolio_id: int) -> Optional[Portfolio]:
        async with session_scope() as db:
            res = await db.execute(
                select(PortfolioModel).where(
                    PortfolioModel.owner_id == owner_id,
                    PortfolioModel.id == portfolio_id
                )
            )
            model = res.scalar_one_or_none()
            if model:
                return Portfolio(id=model.id, owner_id=model.owner_id, name=model.name, created_at=model.created_at)
            return None
        
    async def update_portfolio(self, owner_id: str, portfolio_id: int, payload : PortfolioUpdate):
        async with session_scope() as db:
            kwargs = {}
            if payload.name:
                kwargs["name"] = payload.name
            
            res = await db.execute(
                update(PortfolioModel)
                .returning(PortfolioModel)
                .where(
                    PortfolioModel.owner_id == owner_id,
                    PortfolioModel.id == portfolio_id
                ).values(name=payload.name)
            )
            await db.commit()
            model = res.scalar_one_or_none()
            if model:
                return Portfolio(id=model.id, owner_id=model.owner_id, name=model.name, created_at=model.created_at)
            return None
    
    async def delete_portfolio(self, owner_id: str, portfolio_id: int) -> bool:
        async with session_scope() as db:
            res = await db.execute(delete(PortfolioModel).where(
                PortfolioModel.owner_id == owner_id,
                PortfolioModel.id == portfolio_id
            ))
            await db.commit()
            return res.rowcount > 0
    
    
    async def list_portfolios_paginated(self, owner_id: str, pagination_request: PaginationRequest):
        async with session_scope() as db:
            total_res = await db.execute(
                select(func.count(PortfolioModel.id)).where(PortfolioModel.owner_id == owner_id)
            )
            count = total_res.scalar_one()

            res = await db.execute(
                select(PortfolioModel)
                .where(PortfolioModel.owner_id == owner_id)
                .order_by(PortfolioModel.id.desc())
                .limit(pagination_request.items_per_page)
                .offset(pagination_request.offset)
            )
            items = res.scalars().all()
            portfolios = [
                Portfolio(id=model.id, owner_id=model.owner_id, name=model.name, created_at=model.created_at)
                for model in items
            ]
            return portfolios, create_pagination_response(count, pagination_request)
    
    
    # ----------------- Asset Methods -----------------
    async def create_asset(self, portfolio_id: int, payload: AssetCreate) -> Asset:
        model = AssetModel(
            symbol=payload.symbol,
            quantity=payload.quantity,
            portfolio_id=portfolio_id
        )
        async with session_scope() as db:
            db.add(model)
            await db.commit()
            await db.refresh(model)
        return Asset(
            id=model.id,
            symbol=model.symbol,
            quantity=model.quantity,
            portfolio_id=model.portfolio_id,
            created_at=model.created_at
        )
       
    async def delete_asset(self, asset_id: int) -> bool:
        async with session_scope() as db:
            res = await db.execute(delete(AssetModel).where(
                AssetModel.id == asset_id
            ))
            await db.commit()
            return res.rowcount > 0
    
    async def list_assets_paginated(self, portfolio_id: int, pagination_request : PaginationRequest):
        async with session_scope() as db:
            total_res = await db.execute(
                select(func.count(AssetModel.id)).where(AssetModel.portfolio_id == portfolio_id)
            )
            count = total_res.scalar_one()

            res = await db.execute(
                select(AssetModel)
                .where(AssetModel.portfolio_id == portfolio_id)
                .order_by(AssetModel.id.desc())
                .limit(pagination_request.items_per_page)
                .offset(pagination_request.offset)
            )
            items = res.scalars().all()
            assets = [
                Asset(
                    id=model.id,
                    symbol=model.symbol,
                    quantity=model.quantity,
                    portfolio_id=model.portfolio_id,
                    created_at=model.created_at
                )
                for model in items
            ]
            return assets, create_pagination_response(count, pagination_request)
    
    async def list_assets(self, portfolio_id: int) -> list[Asset]:
        async with session_scope() as db:
            res = await db.execute(
                select(AssetModel).where(AssetModel.portfolio_id == portfolio_id)
            )
            items = res.scalars().all()
            assets = [
                Asset(
                    id=model.id,
                    symbol=model.symbol,
                    quantity=model.quantity,
                    portfolio_id=model.portfolio_id,
                    created_at=model.created_at
                )
                for model in items
            ]
            return assets