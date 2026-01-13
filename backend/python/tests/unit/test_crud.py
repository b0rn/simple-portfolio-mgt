"""
Unit tests for CRUD operations.
"""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock
import uuid
from src import crud, schemas, models


@pytest.mark.unit
class TestPortfolioCRUD:
    """Test portfolio CRUD operations."""

    @pytest.mark.asyncio
    async def test_create_portfolio(self, mock_db_session: AsyncMock):
        """Test creating a portfolio."""
        owner_id = uuid.uuid4()
        payload = schemas.PortfolioCreate(name="Test Portfolio")
        
        # Mock the refresh behavior
        mock_db_session.refresh = AsyncMock()
        
        result = await crud.create_portfolio(mock_db_session, owner_id, payload)
        
        # Verify session methods were called
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_awaited_once()
        mock_db_session.refresh.assert_awaited_once()
        
        # Verify the portfolio attributes
        assert result.name == payload.name
        assert result.owner_id == owner_id

    @pytest.mark.asyncio
    async def test_get_portfolio_found(self, mock_db_session: AsyncMock):
        """Test getting an existing portfolio."""
        owner_id = uuid.uuid4()
        mock_portfolio = models.Portfolio(id=1, name="Test Portfolio", owner_id=owner_id)
        
        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_portfolio
        mock_db_session.execute.return_value = mock_result
        result = await crud.get_portfolio(mock_db_session, owner_id, 1)
        
        assert result is not None
        assert result.id == 1
        assert result.name == mock_portfolio.name
        assert result.owner_id == mock_portfolio.owner_id
        mock_db_session.execute.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_get_portfolio_not_found(self, mock_db_session: AsyncMock):
        """Test getting a non-existent portfolio."""
        # Mock the execute result
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = mock_result
        
        result = await crud.get_portfolio(mock_db_session, uuid.uuid4(), 999)
        
        assert result is None
        mock_db_session.execute.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_delete_portfolio_success(self, mock_db_session: AsyncMock):
        """Test deleting an existing portfolio."""
        # Mock the execute result
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_db_session.execute.return_value = mock_result
        
        result = await crud.delete_portfolio(mock_db_session, uuid.uuid4(), 1)
        
        assert result is True
        mock_db_session.execute.assert_awaited_once()
        mock_db_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_delete_portfolio_not_found(self, mock_db_session: AsyncMock):
        """Test deleting a non-existent portfolio."""
        # Mock the execute result
        mock_result = MagicMock()
        mock_result.rowcount = 0
        mock_db_session.execute.return_value = mock_result
        
        result = await crud.delete_portfolio(mock_db_session, uuid.uuid4(), 999)
        
        assert result is False
        mock_db_session.execute.assert_awaited_once()
        mock_db_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_list_portfolios_paginated(self, mock_db_session: AsyncMock):
        """Test listing portfolios with pagination."""
        owner_id = uuid.uuid4()
        mock_portfolios = [
            models.Portfolio(id=1, name="Portfolio 1", owner_id=owner_id),
            models.Portfolio(id=2, name="Portfolio 2", owner_id=owner_id),
        ]
        
        # Mock count query
        mock_count_result = MagicMock()
        mock_count_result.scalar_one.return_value = 2
        
        # Mock list query
        mock_list_result = MagicMock()
        mock_list_scalars = MagicMock()
        mock_list_scalars.all.return_value = mock_portfolios
        mock_list_result.scalars.return_value = mock_list_scalars
        
        # Setup execute to return different results
        mock_db_session.execute.side_effect = [mock_count_result, mock_list_result]
        
        items, count = await crud.list_portfolios_paginated(mock_db_session, owner_id, 10, 0)
        
        assert count == 2
        assert len(items) == 2
        assert items[0].name == mock_portfolios[0].name
        assert items[0].owner_id == mock_portfolios[0].owner_id
        assert items[1].name == mock_portfolios[1].name
        assert items[1].owner_id == mock_portfolios[1].owner_id
        assert mock_db_session.execute.await_count == 2


@pytest.mark.unit
class TestAssetCRUD:
    """Test asset CRUD operations."""

    @pytest.mark.asyncio
    async def test_create_asset(self, mock_db_session: AsyncMock):
        """Test creating an asset."""
        payload = schemas.AssetCreate(symbol="AAPL", quantity=10.0, buy_price=150.0)
        
        mock_db_session.refresh = AsyncMock()
        result = await crud.create_asset(mock_db_session, portfolio_id=1, payload=payload)
        
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_awaited_once()
        mock_db_session.refresh.assert_awaited_once()
        
        assert result.symbol == payload.symbol
        assert result.quantity == payload.quantity
        assert result.buy_price == payload.buy_price
        assert result.portfolio_id == 1

    @pytest.mark.asyncio
    async def test_create_asset_symbol_uppercase(self, mock_db_session: AsyncMock):
        """Test that asset symbol is converted to uppercase and stripped"""
        payload = schemas.AssetCreate(symbol="aapl ", quantity=10.0, buy_price=150.0)
        
        mock_db_session.refresh = AsyncMock()
        
        result = await crud.create_asset(mock_db_session, portfolio_id=1, payload=payload)
        
        # The symbol should be uppercase and stripped
        added_call = mock_db_session.add.call_args[0][0]
        assert added_call.symbol == "AAPL"

    @pytest.mark.asyncio
    async def test_delete_asset_success(self, mock_db_session: AsyncMock):
        """Test deleting an existing asset."""
        mock_result = MagicMock()
        mock_result.rowcount = 1
        mock_db_session.execute.return_value = mock_result
        
        result = await crud.delete_asset(mock_db_session, 1)
        
        assert result is True
        mock_db_session.execute.assert_awaited_once()
        mock_db_session.commit.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_list_assets_for_portfolio(self, mock_db_session: AsyncMock):
        """Test listing assets for a portfolio."""
        mock_assets = [
            models.Asset(id=1, portfolio_id=1, symbol="AAPL", quantity=10.0, buy_price=150.0),
            models.Asset(id=2, portfolio_id=1, symbol="MSFT", quantity=5.0, buy_price=300.0),
        ]
        
        mock_result = MagicMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_assets
        mock_result.scalars.return_value = mock_scalars
        mock_db_session.execute.return_value = mock_result
        
        result = await crud.list_assets_for_portfolio(mock_db_session, portfolio_id=1)
        
        assert len(result) == 2
        assert result[0].symbol == mock_assets[0].symbol
        assert result[1].symbol == mock_assets[1].symbol
        assert result[0].quantity == mock_assets[0].quantity
        assert result[0].buy_price == mock_assets[0].buy_price
        assert result[1].quantity == mock_assets[1].quantity
        assert result[1].buy_price == mock_assets[1].buy_price
        mock_db_session.execute.assert_awaited_once()


@pytest.mark.asyncio
async def test_list_assets_for_portfolio_paginated(self, mock_db_session: AsyncMock):
    """Test listing assets for a portfolio with pagination."""
    mock_assets = [
        models.Asset(id=1, portfolio_id=1, symbol="AAPL", quantity=10.0, buy_price=150.0),
        models.Asset(id=2, portfolio_id=1, symbol="MSFT", quantity=5.0, buy_price=300.0),
    ]
    
    # Mock count query
    mock_count_result = MagicMock()
    mock_count_result.scalar_one.return_value = 2

    # Mock list query
    mock_result = MagicMock()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = mock_assets
    mock_result.scalars.return_value = mock_scalars

    mock_db_session.execute.side_effect = [mock_count_result, mock_result]
    
    items, count = await crud.list_assets_for_portfolio_paginated(mock_db_session, portfolio_id=1, items_per_page=10, offset=0)
    
    
    assert count == 2
    assert len(items) == 2
    assert items[0].symbol == mock_assets[0].symbol
    assert items[1].symbol == mock_assets[1].symbol
    assert items[0].quantity == mock_assets[0].quantity
    assert items[0].buy_price == mock_assets[0].buy_price
    assert items[1].quantity == mock_assets[1].quantity
    assert items[1].buy_price == mock_assets[1].buy_price
    assert mock_db_session.execute.await_count == 2
