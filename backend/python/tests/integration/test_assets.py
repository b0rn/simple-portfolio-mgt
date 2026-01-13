"""
Integration tests for asset endpoints.
"""
from __future__ import annotations

import pytest
from fastapi import status

from src.routers.assets import FAKE_PRICES


@pytest.mark.integration
@pytest.mark.asyncio
class TestAssetEndpoints:
    """Test asset API endpoints."""

    async def test_create_asset(self, async_client):
        """Test creating an asset."""
        # First create a portfolio
        portfolio_payload = {"name": "Test Portfolio", "owner_name": "Owner"}
        portfolio_response = await async_client.post("/portfolios", json=portfolio_payload)
        assert portfolio_response.status_code == status.HTTP_201_CREATED
        portfolio_id = portfolio_response.json()["id"]
        
        # Create asset
        asset_payload = {"symbol": "aapl ", "quantity": 10.0, "buy_price": 150.0}
        response = await async_client.post(
            f"/portfolios/{portfolio_id}/assets", json=asset_payload
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["symbol"] == asset_payload["symbol"].upper().strip()
        assert data["quantity"] == asset_payload["quantity"]
        assert data["buy_price"] == asset_payload["buy_price"]
        assert data["portfolio_id"] == portfolio_id
        assert "id" in data

    async def test_create_asset_invalid_portfolio(self, async_client):
        """Test creating an asset for a non-existent portfolio."""
        asset_payload = {"symbol": "AAPL", "quantity": 10.0, "buy_price": 150.0}
        response = await async_client.post(
            "/portfolios/99999/assets", json=asset_payload
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "portfolio not found" in response.json()["detail"].lower()

    async def test_create_asset_invalid_data(self, async_client):
        """Test creating an asset with invalid data."""
        # Create portfolio
        portfolio_payload = {"name": "Test Portfolio", "owner_name": "Owner"}
        portfolio_response = await async_client.post("/portfolios", json=portfolio_payload)
        assert portfolio_response.status_code == status.HTTP_201_CREATED
        portfolio_id = portfolio_response.json()["id"]
        
        # Invalid: negative quantity
        asset_payload = {"symbol": "AAPL", "quantity": -10.0, "buy_price": 150.0}
        response = await async_client.post(
            f"/portfolios/{portfolio_id}/assets", json=asset_payload
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Invalid: zero buy_price
        asset_payload = {"symbol": "AAPL", "quantity": 10.0, "buy_price": 0.0}
        response = await async_client.post(
            f"/portfolios/{portfolio_id}/assets", json=asset_payload
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_list_assets(self, async_client):
        """Test listing assets for a portfolio."""
        # Create portfolio
        portfolio_payload = {"name": "Test Portfolio", "owner_name": "Owner"}
        portfolio_response = await async_client.post("/portfolios", json=portfolio_payload)
        assert portfolio_response.status_code == status.HTTP_201_CREATED
        portfolio_id = portfolio_response.json()["id"]
        
        # Create multiple assets
        assets = [
            {"symbol": "AAPL", "quantity": 10.0, "buy_price": 150.0},
            {"symbol": "MSFT", "quantity": 5.0, "buy_price": 300.0},
            {"symbol": "TSLA", "quantity": 3.0, "buy_price": 250.0},
        ]
        for asset_payload in assets:
            await async_client.post(
                f"/portfolios/{portfolio_id}/assets", json=asset_payload
            )
        
        # List assets
        response = await async_client.get(f"/portfolios/{portfolio_id}/assets")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 3
        assert data["count"] == 3
        
        symbols = [item["symbol"] for item in data["items"]]
        assert assets[0]["symbol"] in symbols
        assert assets[1]["symbol"] in symbols
        assert assets[2]["symbol"] in symbols

    async def test_list_assets_pagination(self, async_client):
        """Test listing assets with pagination."""
        # Create portfolio
        portfolio_payload = {"name": "Test Portfolio", "owner_name": "Owner"}
        portfolio_response = await async_client.post("/portfolios", json=portfolio_payload)
        assert portfolio_response.status_code == status.HTTP_201_CREATED
        portfolio_id = portfolio_response.json()["id"]
        
        # Create 5 assets
        for i in range(5):
            asset_payload = {
                "symbol": f"SYM{i}",
                "quantity": 10.0,
                "buy_price": 100.0 + i
            }
            await async_client.post(
                f"/portfolios/{portfolio_id}/assets", json=asset_payload
            )
        
        # Get first page
        response = await async_client.get(
            f"/portfolios/{portfolio_id}/assets?page=1&items_per_page=2"
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
        assert data["count"] == 5
        assert data["page"] == 1

    async def test_delete_asset(self, async_client):
        """Test deleting an asset."""
        # Create portfolio and asset
        portfolio_payload = {"name": "Test Portfolio", "owner_name": "Owner"}
        portfolio_response = await async_client.post("/portfolios", json=portfolio_payload)
        assert portfolio_response.status_code == status.HTTP_201_CREATED
        portfolio_id = portfolio_response.json()["id"]
        
        asset_payload = {"symbol": "AAPL", "quantity": 10.0, "buy_price": 150.0}
        asset_response = await async_client.post(
            f"/portfolios/{portfolio_id}/assets", json=asset_payload
        )
        assert asset_response.status_code == status.HTTP_201_CREATED
        asset_id = asset_response.json()["id"]
        
        # Delete asset
        response = await async_client.delete(f"/assets/{asset_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's gone
        list_response = await async_client.get(f"/portfolios/{portfolio_id}/assets")
        data = list_response.json()
        assert data["count"] == 0
        assert len(data["items"]) == 0

    async def test_delete_asset_not_found(self, async_client):
        """Test deleting a non-existent asset."""
        response = await async_client.delete("/assets/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_portfolio_valuation(self, async_client):
        """Test portfolio valuation endpoint."""
        # Create portfolio
        portfolio_payload = {"name": "Test Portfolio", "owner_name": "Owner"}
        portfolio_response = await async_client.post("/portfolios", json=portfolio_payload)
        assert portfolio_response.status_code == status.HTTP_201_CREATED
        portfolio_id = portfolio_response.json()["id"]
        
        # Add assets with known prices (from FAKE_PRICES)
        assets = [
            {"symbol": "AAPL", "quantity": 10.0, "buy_price": 150.0},
            {"symbol": "MSFT", "quantity": 5.0, "buy_price": 300.0},
            {"symbol": "UNKNOWN", "quantity": 2.0, "buy_price": 100.0},  # Unknown symbol
        ]
        for asset_payload in assets:
            asset_response = await async_client.post(
                f"/portfolios/{portfolio_id}/assets", json=asset_payload
            )
            assert asset_response.status_code == status.HTTP_201_CREATED
        
        # Get valuation
        response = await async_client.get(f"/portfolios/{portfolio_id}/value")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["portfolio_id"] == portfolio_id
        assert data["total_value"] > 0
        assert len(data["lines"]) == 2  # AAPL and MSFT, but not UNKNOWN
        assert "UNKNOWN" in data["unknown_symbols"]
        
        # Verify calculations: AAPL (10 * 180) + MSFT (5 * 400) = 1800 + 2000 = 3800
        expected_total = (10.0 * FAKE_PRICES["AAPL"]) + (5.0 * FAKE_PRICES["MSFT"])
        assert data["total_value"] == expected_total

    async def test_portfolio_valuation_not_found(self, async_client):
        """Test valuation for non-existent portfolio."""
        response = await async_client.get("/portfolios/99999/value")
        assert response.status_code == status.HTTP_404_NOT_FOUND

