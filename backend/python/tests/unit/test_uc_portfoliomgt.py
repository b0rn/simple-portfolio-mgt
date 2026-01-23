"""
Unit tests for portfolioMgt usecase
"""

from __future__ import annotations
import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from datetime import datetime

from src.domain.usecases.portfoliomgt.portfoliomgt import PortfolioMgt
from src.infrastructure.dataservice.dbdataservice import DbDataService
from src.domain.aggregates.health.health import Health
from src.domain.aggregates.portfolio.portfolio import Portfolio
from src.domain.aggregates.portfolio.portfolio_valuation import PortfolioValuation
from src.domain.aggregates.portfolio.asset import Asset
from src.domain.usecases.portfoliomgt.payloads import (
    PortfolioCreate,
    PortfolioUpdate,
    AssetCreate,
)
from src.infrastructure.utils.pagination import PaginationRequest, PaginationResponse


@pytest.mark.unit
@pytest.mark.asyncio
class TestPortfolioMgtUseCase:
    """Test portfolioMgt usecase"""

    def __get_uc(self, mock_db_dataservice: DbDataService):
        return PortfolioMgt(data_service=mock_db_dataservice)

    async def test_health_check(self, mock_db_dataservice: DbDataService):
        health = Health(errors=["err1"], warnings=["warn1"])
        mock_db_dataservice.health_check = AsyncMock()
        mock_db_dataservice.health_check.return_value = health
        uc = self.__get_uc(mock_db_dataservice=mock_db_dataservice)

        res = await uc.health_check()

        assert res == health
        mock_db_dataservice.health_check.assert_awaited_once()

    async def test_create_portfolio(self, mock_db_dataservice: DbDataService):
        portfolio = Portfolio(
            id=0, owner_id=uuid4(), name="foo", created_at=datetime.now()
        )
        mock_db_dataservice.create_portfolio = AsyncMock()
        mock_db_dataservice.create_portfolio.return_value = portfolio
        uc = self.__get_uc(mock_db_dataservice=mock_db_dataservice)

        owner_id = "bar"
        payload = PortfolioCreate(name="test")
        res = await uc.create_portfolio(owner_id=owner_id, payload=payload)

        assert res == portfolio
        mock_db_dataservice.create_portfolio.assert_awaited_once_with(owner_id, payload)

    async def test_get_portfolio(self, mock_db_dataservice: DbDataService):
        portfolio = Portfolio(
            id=0, owner_id=uuid4(), name="foo", created_at=datetime.now()
        )
        mock_db_dataservice.get_portfolio = AsyncMock()
        mock_db_dataservice.get_portfolio.return_value = portfolio
        uc = self.__get_uc(mock_db_dataservice)

        owner_id = "my-id"
        res = await uc.get_portfolio(owner_id, portfolio.id)

        assert res == portfolio
        mock_db_dataservice.get_portfolio.assert_awaited_once_with(
            owner_id, portfolio.id
        )

    async def test_update_portfolio(self, mock_db_dataservice: DbDataService):
        portfolio = Portfolio(
            id=0, owner_id=uuid4(), name="foo", created_at=datetime.now()
        )
        mock_db_dataservice.update_portfolio = AsyncMock()
        mock_db_dataservice.update_portfolio.return_value = portfolio
        uc = self.__get_uc(mock_db_dataservice)

        owner_id = "my-id"
        payload = PortfolioUpdate(name="bar")
        res = await uc.update_portfolio(
            owner_id=owner_id, portfolio_id=portfolio.id, payload=payload
        )

        assert res == portfolio
        mock_db_dataservice.update_portfolio.assert_awaited_once_with(
            owner_id=owner_id, portfolio_id=portfolio.id, payload=payload
        )

    async def test_delete_portfolio(self, mock_db_dataservice: DbDataService):
        mock_db_dataservice.delete_portfolio = AsyncMock()
        mock_db_dataservice.delete_portfolio.return_value = True
        uc = self.__get_uc(mock_db_dataservice)

        owner_id = "my-id"
        p_id = 5
        res = await uc.delete_portfolio(owner_id=owner_id, portfolio_id=p_id)

        assert res == True
        mock_db_dataservice.delete_portfolio.assert_awaited_once_with(owner_id, p_id)

    async def test_list_portfolios_paginated(self, mock_db_dataservice: DbDataService):
        portfolios = [
            Portfolio(id=0, owner_id=uuid4(), name="foo", created_at=datetime.now()),
            Portfolio(id=1, owner_id=uuid4(), name="bar", created_at=datetime.now()),
        ]
        page_res = PaginationResponse(
            total_items=2, total_pages=1, current_page=1, items_per_page=20
        )
        mock_db_dataservice.list_portfolios_paginated = AsyncMock()
        mock_db_dataservice.list_portfolios_paginated.return_value = (
            portfolios,
            page_res,
        )
        uc = self.__get_uc(mock_db_dataservice=mock_db_dataservice)

        owner_id = "my-id"
        page_req = PaginationRequest(items_per_page=5, page=8)
        res_portfolios, res_page_res = await uc.list_portfolios_paginated(
            owner_id=owner_id, pagination_request=page_req
        )

        assert len(res_portfolios) == len(portfolios)
        for i in range(len(res_portfolios)):
            assert res_portfolios[i].id == portfolios[i].id
            assert res_portfolios[i].owner_id == portfolios[i].owner_id
            assert res_portfolios[i].name == portfolios[i].name
            assert res_portfolios[i].created_at == portfolios[i].created_at
        assert res_page_res == page_res
        mock_db_dataservice.list_portfolios_paginated.assert_awaited_once_with(
            owner_id, page_req
        )

    async def test_compute_portfolio_valuation(
        self, mock_db_dataservice: DbDataService
    ):
        prices = (self.__get_uc(mock_db_dataservice)).get_assets_prices()
        symbols = [k for k in prices.keys()]
        assert len(symbols) > 1
        assets = [
            Asset(
                id=0,
                portfolio_id=0,
                symbol=symbols[0],
                quantity=5,
                created_at=datetime.now(),
            ),
            Asset(
                id=5,
                portfolio_id=0,
                symbol=symbols[len(symbols) - 1],
                quantity=5,
                created_at=datetime.now(),
            ),
            Asset(
                id=8,
                portfolio_id=0,
                symbol="UNKNOWN",
                quantity=544,
                created_at=datetime.now(),
            ),
        ]
        mock_db_dataservice.list_assets = AsyncMock()
        mock_db_dataservice.list_assets.return_value = assets
        uc = self.__get_uc(mock_db_dataservice)

        p_id = 5
        res = await uc.compute_portfolio_valuation(portfolio_id=p_id)

        assert res.portfolio_id == p_id
        assert len(res.lines) == len(assets) - 1
        assert len(res.unknown_symbols) == 1
        assert res.unknown_symbols == [
            a.symbol for a in assets if a.symbol not in symbols
        ]
        total_value = 0
        for i in range(len(res.lines)):
            a = next((a for a in assets if a.symbol == res.lines[i].symbol), None)
            if a is None:
                raise Exception(f"asset with symbol {res.lines[i].symbol} not found")
            price = next(
                (v for k, v in prices.items() if res.lines[i].symbol == k), None
            )
            if price is None:
                raise Exception(f"price not found for symbol {res.lines[i].symbol}")

            assert res.lines[i].quantity == a.quantity
            assert res.lines[i].price == price
            assert res.lines[i].value == a.quantity * price
            total_value += a.quantity * price
        assert res.total_value == total_value

    async def test_create_asset(self, mock_db_dataservice: DbDataService):
        asset = Asset(
            id=0, portfolio_id=5, symbol="BTC", quantity=8, created_at=datetime.now()
        )
        mock_db_dataservice.create_asset = AsyncMock()
        mock_db_dataservice.create_asset.return_value = asset
        uc = self.__get_uc(mock_db_dataservice)

        p_id = 5
        payload = AssetCreate(symbol="BTC", quantity=8)
        res = await uc.create_asset(p_id, payload)

        assert res == asset
        mock_db_dataservice.create_asset.assert_awaited_once_with(p_id, payload)

    async def test_delete_asset(self, mock_db_dataservice: DbDataService):
        mock_db_dataservice.delete_asset = AsyncMock()
        mock_db_dataservice.delete_asset.return_value = True
        uc = self.__get_uc(mock_db_dataservice)

        a_id = 8
        res = await uc.delete_asset(a_id)

        assert res == True
        mock_db_dataservice.delete_asset.assert_awaited_once_with(a_id)

    async def test_list_assets_paginated(self, mock_db_dataservice: DbDataService):
        assets = [
            Asset(
                id=0,
                portfolio_id=0,
                symbol="BTC",
                quantity=4,
                created_at=datetime.now(),
            ),
            Asset(
                id=1,
                portfolio_id=0,
                symbol="ETH",
                quantity=0.07,
                created_at=datetime.now(),
            ),
        ]
        page_res = PaginationResponse(
            total_items=8, total_pages=4, current_page=2, items_per_page=7
        )
        mock_db_dataservice.list_assets_paginated = AsyncMock()
        mock_db_dataservice.list_assets_paginated.return_value = assets, page_res
        uc = self.__get_uc(mock_db_dataservice)

        p_id = 14
        page_req = PaginationRequest(items_per_page=28, page=17)
        res_assets, res_page_res = await uc.list_assets_paginated(p_id, page_req)

        assert len(res_assets) == len(assets)
        for i in range(len(res_assets)):
            assert res_assets[i].id == assets[i].id
            assert res_assets[i].portfolio_id == assets[i].portfolio_id
            assert res_assets[i].symbol == assets[i].symbol
            assert res_assets[i].quantity == assets[i].quantity
            assert res_assets[i].created_at == assets[i].created_at
        assert res_page_res.current_page == page_res.current_page
        assert res_page_res.items_per_page == page_res.items_per_page
        assert res_page_res.total_items == page_res.total_items
        assert res_page_res.total_pages == page_res.total_pages
