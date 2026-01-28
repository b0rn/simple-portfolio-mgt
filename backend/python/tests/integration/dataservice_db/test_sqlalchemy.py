"""
Integration tests for the SQLAlchemy database dataservice.
"""

from __future__ import annotations
import pytest
from uuid import uuid4
from src.infrastructure.dataservice.dbdataservice import DbDataService
from src.infrastructure.datastore.sqlalchemy.models.user import User as UserModel
from src.domain.usecases.portfoliomgt.payloads import (
    PortfolioCreate,
    PortfolioUpdate,
    AssetCreate,
)
from src.infrastructure.utils.pagination import PaginationRequest


@pytest.mark.integration
@pytest.mark.asyncio
class TestSQLAlchemy:
    """Test database dataservice : SQLAlchemy"""

    async def test_create_portfolio(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        owner_id = dataservice_auth_local_user[0].id
        portfolio = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        assert portfolio.id >= 0
        assert portfolio.name == "foo"
        assert portfolio.owner_id == owner_id

        # Invalid owner_id (non-existent user)
        with pytest.raises(Exception):
            await dataservice_db_sqlalchemy.create_portfolio(
                owner_id=str(uuid4()), payload=PortfolioCreate(name="foo")
            )

    async def test_get_portfolio(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        # Create portfolio
        owner_id = dataservice_auth_local_user[0].id
        created = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        # Read portfolio
        read = await dataservice_db_sqlalchemy.get_portfolio(
            owner_id=str(owner_id), portfolio_id=created.id
        )

        assert read is not None
        assert read.id == created.id
        assert read.name == "foo"
        assert read.owner_id == owner_id

        # Unknown portfolio
        read = await dataservice_db_sqlalchemy.get_portfolio(
            owner_id=str(owner_id), portfolio_id=9999
        )

        assert read is None

    async def test_update_portfolio(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        # Create portfolio
        owner_id = dataservice_auth_local_user[0].id
        created = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        # Update portfolio
        updated = await dataservice_db_sqlalchemy.update_portfolio(
            owner_id=str(owner_id),
            portfolio_id=created.id,
            payload=PortfolioUpdate(name="bar"),
        )

        # Assert that the returned object is updated
        assert updated is not None
        assert updated.id == created.id
        assert updated.name == "bar"
        assert updated.owner_id == owner_id

        # Read portfolio (to assert that it was really updated in db)
        read = await dataservice_db_sqlalchemy.get_portfolio(
            owner_id=str(owner_id), portfolio_id=created.id
        )

        assert read is not None
        assert read.name == "bar"

        # Unknown portfolio
        read = await dataservice_db_sqlalchemy.update_portfolio(
            owner_id=str(owner_id),
            portfolio_id=9999,
            payload=PortfolioUpdate(name="test"),
        )

    async def test_delete_portfolio(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        # Create portfolio
        owner_id = dataservice_auth_local_user[0].id
        created = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        # Delete portfolio
        deleted = await dataservice_db_sqlalchemy.delete_portfolio(
            owner_id=str(owner_id), portfolio_id=created.id
        )

        assert deleted

        # Read portfolio
        read = await dataservice_db_sqlalchemy.get_portfolio(
            owner_id=str(owner_id), portfolio_id=created.id
        )

        assert read is None

        # Unknown portfolio
        deleted = await dataservice_db_sqlalchemy.delete_portfolio(
            owner_id=str(owner_id), portfolio_id=9999
        )

        assert not deleted

    async def test_list_portfolios_paginated(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        owner_id = dataservice_auth_local_user[0].id
        for i in range(10):
            await dataservice_db_sqlalchemy.create_portfolio(
                owner_id=str(owner_id), payload=PortfolioCreate(name=f"foo{i}")
            )

        pagination_request = PaginationRequest(items_per_page=5, page=1)
        (
            portfolios,
            page_res,
        ) = await dataservice_db_sqlalchemy.list_portfolios_paginated(
            owner_id=str(owner_id), pagination_request=pagination_request
        )

        assert len(portfolios) == 5
        assert page_res.current_page == 1
        assert page_res.items_per_page == 5
        assert page_res.total_items == 10
        assert page_res.total_pages == 2

        # No results
        (
            portfolios,
            page_res,
        ) = await dataservice_db_sqlalchemy.list_portfolios_paginated(
            owner_id=str(uuid4()), pagination_request=pagination_request
        )

        assert len(portfolios) == 0
        assert page_res.current_page == pagination_request.page
        assert page_res.items_per_page == pagination_request.items_per_page
        assert page_res.total_items == 0
        assert page_res.total_pages == 0

    async def test_create_asset(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        # Create portfolio
        owner_id = dataservice_auth_local_user[0].id
        portfolio = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        # Create asset
        asset = await dataservice_db_sqlalchemy.create_asset(
            portfolio_id=portfolio.id, payload=AssetCreate(symbol="BTC", quantity=0.001)
        )

        assert asset.id >= 0
        assert asset.symbol == "BTC"
        assert asset.quantity == 0.001
        assert asset.portfolio_id == portfolio.id

        # Unknown portfolio
        with pytest.raises(Exception):
            await dataservice_db_sqlalchemy.create_asset(
                portfolio_id=9999, payload=AssetCreate(symbol="BTC", quantity=0.005)
            )

    async def test_delete_asset(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        # Create portfolio
        owner_id = dataservice_auth_local_user[0].id
        portfolio = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        # Create asset
        asset = await dataservice_db_sqlalchemy.create_asset(
            portfolio_id=portfolio.id, payload=AssetCreate(symbol="BTC", quantity=0.001)
        )

        # Delete asset
        deleted = await dataservice_db_sqlalchemy.delete_asset(asset_id=asset.id)

        assert deleted

        # List assets for portfolio
        assets = await dataservice_db_sqlalchemy.list_assets(portfolio_id=portfolio.id)

        assert len(assets) == 0

        # Unknown asset
        deleted = await dataservice_db_sqlalchemy.delete_asset(asset_id=9999)

        assert not deleted

    async def test_list_assets_paginated(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        # Create portfolio
        owner_id = dataservice_auth_local_user[0].id
        portfolio = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        # Create assets
        for i in range(10):
            await dataservice_db_sqlalchemy.create_asset(
                portfolio_id=portfolio.id,
                payload=AssetCreate(symbol="BTC", quantity=0.001),
            )

        page_req = PaginationRequest(items_per_page=5, page=1)
        assets, page_res = await dataservice_db_sqlalchemy.list_assets_paginated(
            portfolio_id=portfolio.id, pagination_request=page_req
        )

        assert len(assets) == 5
        assert page_res.current_page == 1
        assert page_res.items_per_page == 5
        assert page_res.total_items == 10
        assert page_res.total_pages == 2

    async def test_list_assets(
        self,
        dataservice_db_sqlalchemy: DbDataService,
        dataservice_auth_local_user: tuple[UserModel, str, str],
    ):
        # Create portfolio
        owner_id = dataservice_auth_local_user[0].id
        portfolio = await dataservice_db_sqlalchemy.create_portfolio(
            owner_id=str(owner_id), payload=PortfolioCreate(name="foo")
        )

        # Create assets
        created = [
            await dataservice_db_sqlalchemy.create_asset(
                portfolio_id=portfolio.id,
                payload=AssetCreate(symbol="BTC", quantity=0.001),
            )
            for i in range(10)
        ]

        assets = await dataservice_db_sqlalchemy.list_assets(portfolio_id=portfolio.id)

        assert len(assets) == len(created)
