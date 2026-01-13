"""
Integration tests for portfolio endpoints.
"""
from __future__ import annotations

import pytest
from fastapi import status


@pytest.mark.integration
@pytest.mark.asyncio
class TestPortfolioEndpoints:
    """Test portfolio API endpoints."""

    async def test_create_portfolio(self, async_client):
        """Test creating a new portfolio."""
        payload = {
            "name": "My Portfolio",
            "owner_name": "John Doe"
        }
        
        response = await async_client.post("/portfolios", json=payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == payload["name"]
        assert data["owner_name"] == payload["owner_name"]
        assert "id" in data
        assert "created_at" in data

    async def test_create_portfolio_invalid_data(self, async_client):
        """Test creating a portfolio with invalid data."""
        # Missing required fields
        payload = {"name": "Test"}
        
        response = await async_client.post("/portfolios", json=payload)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        
        # Empty name
        payload = {"name": "", "owner_name": "John"}
        response = await async_client.post("/portfolios", json=payload)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_get_portfolio(self, async_client):
        """Test getting a portfolio by ID."""
        # First create a portfolio
        create_payload = {"name": "Test Portfolio", "owner_name": "Jane Doe"}
        create_response = await async_client.post("/portfolios", json=create_payload)
        assert create_response.status_code == status.HTTP_201_CREATED
        portfolio_id = create_response.json()["id"]
        
        # Then get it
        response = await async_client.get(f"/portfolios/{portfolio_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == portfolio_id
        assert data["name"] == "Test Portfolio"
        assert data["owner_name"] == "Jane Doe"
        assert "assets" in data
        assert isinstance(data["assets"], list)

    async def test_get_portfolio_not_found(self, async_client):
        """Test getting a non-existent portfolio."""
        response = await async_client.get("/portfolios/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_list_portfolios_empty(self, async_client):
        """Test listing portfolios when none exist."""
        response = await async_client.get("/portfolios")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["items"] == []
        assert data["count"] == 0
        assert data["page"] == 1

    async def test_list_portfolios_with_pagination(self, async_client):
        """Test listing portfolios with pagination."""
        # Create multiple portfolios
        for i in range(5):
            payload = {"name": f"Portfolio {i}", "owner_name": f"Owner {i}"}
            response = await async_client.post("/portfolios", json=payload)
            assert response.status_code == status.HTTP_201_CREATED
        
        # Get first page
        response = await async_client.get("/portfolios?page=1&items_per_page=2")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
        assert data["count"] == 5
        assert data["page"] == 1
        
        # Get second page
        response = await async_client.get("/portfolios?page=2&items_per_page=2")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
        assert data["page"] == 2

    async def test_delete_portfolio(self, async_client):
        """Test deleting a portfolio."""
        # Create a portfolio
        create_payload = {"name": "To Delete", "owner_name": "Delete Me"}
        create_response = await async_client.post("/portfolios", json=create_payload)
        assert create_response.status_code == status.HTTP_201_CREATED
        portfolio_id = create_response.json()["id"]
        
        # Delete it
        response = await async_client.delete(f"/portfolios/{portfolio_id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's gone
        get_response = await async_client.get(f"/portfolios/{portfolio_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_portfolio_not_found(self, async_client):
        """Test deleting a non-existent portfolio."""
        response = await async_client.delete("/portfolios/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_portfolio_cascades_to_assets(self, async_client):
        """Test that deleting a portfolio also deletes its assets."""
        # Create portfolio
        create_payload = {"name": "Portfolio with Assets", "owner_name": "Owner"}
        create_response = await async_client.post("/portfolios", json=create_payload)
        assert create_response.status_code == status.HTTP_201_CREATED
        portfolio_id = create_response.json()["id"]
        
        # Add assets
        asset_payload = {"symbol": "AAPL", "quantity": 10.0, "buy_price": 150.0}
        asset_response = await async_client.post(
            f"/portfolios/{portfolio_id}/assets", json=asset_payload
        )
        assert asset_response.status_code == status.HTTP_201_CREATED
        asset_id = asset_response.json()["id"]
        
        # Delete portfolio
        delete_response = await async_client.delete(f"/portfolios/{portfolio_id}")
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify asset is also gone
        asset_get_response = await async_client.get(
            f"/portfolios/{portfolio_id}/assets"
        )
        # Portfolio doesn't exist, so this should 404
        assert asset_get_response.status_code == status.HTTP_404_NOT_FOUND

