"""
Integration tests for health check endpoint.
"""
from __future__ import annotations

import pytest
from fastapi import status


@pytest.mark.integration
@pytest.mark.asyncio
class TestHealthEndpoint:
    """Test health check endpoint."""

    async def test_health_check(self, async_client):
        """Test health check endpoint returns OK."""
        response = await async_client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["status"] == "ok"
        assert "env" in data
        assert "db" in data
        assert data["db"] == "ok"

