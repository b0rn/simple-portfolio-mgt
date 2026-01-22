"""
Integration tests for the REST API
"""
from __future__ import annotations
import pytest
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient
from uuid import uuid4
from datetime import datetime

from src.domain.usecases.authmgt.authmgt import AuthMgt
from src.domain.usecases.portfoliomgt.portfoliomgt import PortfolioMgt
from src.domain.aggregates.auth.user import User
from src.domain.aggregates.portfolio.portfolio import Portfolio
from src.domain.aggregates.portfolio.portfolio_valuation import PortfolioValuation, ValuationLine
from src.domain.aggregates.portfolio.asset import Asset
from src.domain.aggregates.health.health import Health
from src.infrastructure.utils.pagination import PaginationRequest, PaginationResponse
from src.domain.usecases.portfoliomgt.payloads import PortfolioCreate, PortfolioUpdate
from src.domain.usecases.portfoliomgt.payloads import AssetCreate

@pytest.mark.integration
@pytest.mark.asyncio
class TestREST:
    """ Test REST API """
    
    def __set_authed_uc(self, auth_uc : AuthMgt) -> User:
        user = User(id=uuid4(), email="foo@bar.com", created_at=datetime.now())
        auth_uc.get_user_from_token = AsyncMock()
        auth_uc.get_user_from_token.return_value = user
        return user
    
    def _get_authed_cookies(self) -> dict[str,str]:
        return { "access_token" : "token" }
        
    # ----------------------- Global ---------------------------
    async def test_health_check(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt] ):
        client, auth_uc , portfolio_uc = rest_client
        auth_health = Health(errors=["aerr1","aerr2"],warnings=["awarr1","awarr2"])
        portfolio_health = Health(errors=["perr1","perr2"], warnings=["pwarn1","pwarn2"])
        auth_uc.health_check = AsyncMock()
        auth_uc.health_check.return_value = auth_health
        portfolio_uc.health_check = AsyncMock()
        portfolio_uc.health_check.return_value = portfolio_health 
        
        res = await client.get("/health")
        data = res.json()
        
        assert res.status_code == 500
        assert isinstance(data, dict)
        assert isinstance(data["errors"], list)
        assert len(data["errors"]) == len(auth_health.errors) + len(portfolio_health.errors)
        for p_err in portfolio_health.errors:
            assert p_err in data["errors"]
        for p_warn in portfolio_health.warnings:
            assert p_warn in data["warnings"]
        for a_err in auth_health.errors:
            assert a_err in data["errors"]
        for a_warn in auth_health.warnings:
            assert a_warn in data["warnings"]
        auth_uc.health_check.assert_called_once()
        portfolio_uc.health_check.assert_called_once()
        
        # No errors, no warnings
        auth_uc.health_check.return_value = Health(errors=[],warnings=[])
        portfolio_uc.health_check.return_value = Health(errors=[],warnings=[])
        auth_uc.health_check.reset_mock()
        portfolio_uc.health_check.reset_mock()
        
        res = await client.get("/health")
        data = res.json()
        
        assert res.status_code == 200
        assert isinstance(data["errors"],list)
        assert len(data["errors"]) == 0
        assert isinstance(data["warnings"], list)
        assert len(data["warnings"]) == 0
        auth_uc.health_check.assert_awaited_once()
        portfolio_uc.health_check.assert_awaited_once()
        
        # Only warnings
        auth_health = Health(errors=[],warnings=["awarn1","awarn2"])
        portfolio_health = Health(errors=[], warnings=["pwarn1","pwarn2"])
        auth_uc.health_check.return_value = auth_health
        portfolio_uc.health_check.return_value = portfolio_health
        auth_uc.health_check.reset_mock()
        portfolio_uc.health_check.reset_mock()
        
        res = await client.get("/health")
        data = res.json()
        
        assert res.status_code == 200
        assert isinstance(data["errors"], list)
        assert len(data["errors"]) == 0
        assert isinstance(data["warnings"], list)
        assert len(data["warnings"]) == len(auth_health.warnings) + len(portfolio_health.warnings)
        for a_warn in auth_health.warnings:
            assert a_warn in data["warnings"]
        for p_warn in portfolio_health.warnings:
            assert p_warn in data["warnings"]
        auth_uc.health_check.assert_awaited_once()
        portfolio_uc.health_check.assert_awaited_once()
        
        # Only errors
        auth_health = Health(errors=["aerr1","aerr2"],warnings=[])
        portfolio_health = Health(errors=["perr1","perr2"], warnings=[])
        auth_uc.health_check.return_value = auth_health
        portfolio_uc.health_check.return_value = portfolio_health
        auth_uc.health_check.reset_mock()
        portfolio_uc.health_check.reset_mock()
        
        res = await client.get("/health")
        data = res.json()
        
        assert res.status_code == 500
        assert isinstance(data, dict)
        assert isinstance(data["errors"], list)
        assert len(data["errors"]) == len(auth_health.errors) + len(portfolio_health.errors)
        for a_err in auth_health.errors:
            assert a_err in data["errors"]
        for p_err in portfolio_health.warnings:
            assert p_err in data["errors"]
        assert isinstance(data["warnings"], list)
        assert len(data["warnings"]) == 0
        auth_uc.health_check.assert_awaited_once()
        portfolio_uc.health_check.assert_awaited_once()
    
    async def test_get_prices(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        self.__set_authed_uc(auth_uc)
        prices : dict[str,float] = { "BTC" : 98000.54, "ETH" : 35440.0 }
        portfolio_uc.get_assets_prices = MagicMock()
        portfolio_uc.get_assets_prices.return_value = prices
        
        res = await client.get("/prices", cookies=self._get_authed_cookies())
        data = res.json()
        
        assert res.status_code == 200
        assert data == prices
        portfolio_uc.get_assets_prices.assert_called_once()
        
        # No token
        res = await client.get("/prices")
        
        assert res.status_code == 401
        
        
    # ----------------------- Auth routes --------------------
    async def test_auth_register(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, _ = rest_client
        auth_uc.register = AsyncMock()
        user = User(id=uuid4(), email="foo@bar.com", created_at=datetime.now())
        auth_uc.register.return_value = user, "token"
        
        
        payload = {"email" : user.email, "password" : "password123!"}
        res = await client.post("/auth/register", json=payload)
        data = res.json()
        
        assert res.status_code == 201
        user_json = data.get("user")
        assert user_json is not None
        assert isinstance(user_json, dict)
        assert isinstance(user_json.get("id"), str)
        assert user_json.get("id") != ""
        assert isinstance(user_json.get("email"), str)
        assert user_json.get("email") != ""
        created_at_raw = user_json.get("created_at")
        assert isinstance(created_at_raw, str)
        datetime.fromisoformat(created_at_raw)
        auth_uc.register.assert_awaited_once_with(payload["email"], payload["password"])
        
        # Empty email
        payload = { "password" : "password123!" }
        res = await client.post("/auth/register", json=payload)
        
        assert res.status_code == 422
        
        # Empty password
        payload = { "email" : user.email }
        res = await client.post("/auth/register", json=payload)
        
        assert res.status_code == 422
        
        # Password to short
        payload = { "email" : user.email, "password" : "short" }
        res = await client.post("/auth/register", json=payload)
        
        assert res.status_code == 422
        
    async def test_auth_login(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, _ = rest_client
        auth_uc.login = AsyncMock()
        user = User(id=uuid4(), email="foo@bar.com", created_at=datetime.now())
        auth_uc.login = AsyncMock()
        auth_uc.login.return_value = user, "token"
        
        payload = {"email" : user.email, "password" : "password123!"}
        res = await client.post("/auth/login",json=payload)
        data = res.json()
        
        assert res.status_code == 200
        user_json = data.get("user")
        assert "access_token=" in res.headers["set-cookie"]
        assert "HttpOnly" in res.headers["set-cookie"]
        assert user_json is not None
        assert isinstance(user_json, dict)
        assert isinstance(user_json.get("id"), str)
        assert user_json.get("id") != ""
        assert isinstance(user_json.get("email"), str)
        assert user_json.get("email") != ""
        created_at_raw = user_json.get("created_at")
        assert isinstance(created_at_raw, str)
        datetime.fromisoformat(created_at_raw)
        auth_uc.login.assert_awaited_once_with(payload["email"],payload["password"])
        
        # Empty email
        payload = { "password" : "password123!"}
        res = await client.post("/auth/login",json=payload)
        
        assert res.status_code == 422
        
        # Empty password
        payload = { "email" : user.email }
        res = await client.post("/auth/login",json=payload)
        
        assert res.status_code == 422
        
        # Short password
        payload = { "password" : "short"}
        res = await client.post("/auth/login",json=payload)
        
        assert res.status_code == 422
    
    async def test_logout(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, _, _ = rest_client
        
        res = await client.post("/auth/logout")
        
        assert res.status_code == 200
        set_cookie = res.headers.get("set-cookie")
        assert set_cookie is not None
        assert "access_token=" in set_cookie
        assert "Max-Age=0" in set_cookie or "expires=" in set_cookie.lower()
    
    async def test_me(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, _ = rest_client
        user = User(id=uuid4(), email="foo@bar.com", created_at=datetime.now())
        auth_uc.get_user_from_token = AsyncMock()
        auth_uc.get_user_from_token.return_value = user
        
        res = await client.get("/auth/me", cookies=self._get_authed_cookies())
        
        assert res.status_code == 200
        auth_uc.get_user_from_token.assert_awaited_once_with("token")
        
        # No token, expect 401
        res = await client.get("/auth/me")
        
        assert res.status_code == 401
        
    # ----------------------- Portfolios route ----------------
    async def test_portfolio_create(self,rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio = Portfolio(id=0, owner_id=user.id, name="foo", created_at=datetime.now())
        portfolio_uc.create_portfolio = AsyncMock()
        portfolio_uc.create_portfolio.return_value = portfolio

        payload = { "name" : "foo" }
        res = await client.post("/portfolios", json=payload, cookies=self._get_authed_cookies())
        data = res.json()
        
        assert res.status_code == 201
        assert isinstance(data.get("id"), int)
        assert data.get("owner_id") == str(portfolio.owner_id)
        assert data.get("name") == portfolio.name
        assert data.get("created_at") == portfolio.created_at.isoformat()
        portfolio_uc.create_portfolio.assert_awaited_once_with(owner_id=portfolio.owner_id,payload=PortfolioCreate(name=portfolio.name))
        
        # No token
        res = await client.post("/portfolios",json=payload)
        
        assert res.status_code == 401
        
        # No name
        res = await client.post("/portfolios", json={}, cookies={ "access_token" : "token" })
        
        assert res.status_code == 422
        
        # Name too long
        res = await client.post("/portfolios", json={ "name" : "a" * 101 }, cookies={ "access_token" : "token" })
        
        assert res.status_code == 422
    
    async def test_portfolio_list(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolios = [Portfolio(id=0, owner_id=user.id, name="test", created_at=datetime.now())]
        page_res = PaginationResponse(total_items=1, total_pages=1, current_page=1, items_per_page=20)
        portfolio_uc.list_portfolios_paginated = AsyncMock()
        portfolio_uc.list_portfolios_paginated.return_value = portfolios , page_res 
        
        res = await client.get("/portfolios", cookies=self._get_authed_cookies())
        data = res.json()
        
        assert res.status_code == 200
        items = data.get("items")
        assert isinstance(items, list)
        assert len(items) == len(portfolios)
        for i in range(len(items)):
            item = items[i]
            assert isinstance(item, dict)
            assert item["id"] == portfolios[i].id
            assert item["name"] == portfolios[i].name
            assert item["owner_id"] == str(portfolios[i].owner_id)
            assert item["created_at"] == portfolios[i].created_at.isoformat()
        pagination_response = data.get("pagination_response")
        assert pagination_response is not None
        assert isinstance(pagination_response, dict)
        assert pagination_response["total_items"] == page_res.total_items
        assert pagination_response["total_pages"] == page_res.total_pages
        assert pagination_response["current_page"] == page_res.current_page
        assert pagination_response["items_per_page"] == page_res.items_per_page
        portfolio_uc.list_portfolios_paginated.assert_awaited_once_with(owner_id=user.id,pagination_request=PaginationRequest(page=1,items_per_page=20))
        
        # No token
        res = await client.get("/portfolios")
        
        assert res.status_code == 401
        
        # Non-default page request
        page_res = PaginationResponse(total_items=58, total_pages=900, current_page=8,items_per_page=12) 
        portfolio_uc.list_portfolios_paginated.return_value = portfolios, page_res
        portfolio_uc.list_portfolios_paginated.reset_mock()
        res = await client.get(f"/portfolios?items_per_page={page_res.items_per_page}&page={page_res.current_page}", cookies=self._get_authed_cookies())
        data = res.json()
        
        assert res.status_code == 200
        pagination_response = data.get("pagination_response")
        assert isinstance(pagination_response, dict)
        assert pagination_response["total_items"] == page_res.total_items
        assert pagination_response["total_pages"] == page_res.total_pages
        assert pagination_response["current_page"] == page_res.current_page
        assert pagination_response["items_per_page"] == page_res.items_per_page
        portfolio_uc.list_portfolios_paginated.assert_awaited_once_with(owner_id=user.id,pagination_request=PaginationRequest(page=page_res.current_page,items_per_page=page_res.items_per_page))
        
        # Invalid page
        res = await client.get("/portfolios?page=invalid", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        # Invalid items per page
        res = await client.get("/portfolios?items_per_page=invalid", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        # Max items per page
        res = await client.get("/portfolios?items_per_page=101", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
    async def test_portfolio_get(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio = Portfolio(id=0, owner_id=user.id, name="foo", created_at=datetime.now())
        portfolio_uc.get_portfolio = AsyncMock()
        portfolio_uc.get_portfolio.return_value = portfolio
        
        id = 54
        res = await client.get(f"/portfolios/{id}", cookies=self._get_authed_cookies())
        data = res.json()
        
        assert res.status_code == 200
        assert data["id"] == portfolio.id
        assert data["owner_id"] == str(user.id)
        assert data["name"] == portfolio.name
        assert data["created_at"] == portfolio.created_at.isoformat()
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=id)
        
        # No token
        res = await client.get(f"/portfolios/{id}")
        
        assert res.status_code == 401
        
        # No portfolio
        portfolio_uc.get_portfolio.return_value = None
        portfolio_uc.get_portfolio.reset_mock()
        
        id = 500
        res = await client.get(f"/portfolios/{id}", cookies=self._get_authed_cookies())
        
        assert res.status_code == 404
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=500)
        
        # Invalid id
        res = await client.get("/portfolios/invalid", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
    
    async def test_portfolio_patch(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio = Portfolio(id=0, owner_id=user.id, name="foo", created_at=datetime.now())
        portfolio_uc.update_portfolio = AsyncMock()
        portfolio_uc.update_portfolio.return_value = portfolio
        
        payload = { "name" : "bar" }
        id = 14
        res = await client.patch(f"/portfolios/{id}", cookies=self._get_authed_cookies(), json=payload)
        data = res.json()
        
        assert res.status_code == 200
        assert data["id"] == portfolio.id
        assert data["owner_id"] == str(portfolio.owner_id)
        assert data["name"] == portfolio.name
        assert data["created_at"] == portfolio.created_at.isoformat()
        portfolio_uc.update_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=id, payload=PortfolioUpdate(name=payload["name"]))
        
        # No token
        res = await client.patch(f"/portfolios/{id}", json=payload)
        
        assert res.status_code == 401
        
        # Name max length
        payload = { "name" : "a" * 101 }
        res = await client.patch(f"/portfolios/{id}", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
        # Invalid id
        res = await client.patch("/portfolios/invalid", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
    async def test_portfolio_delete(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio_uc.delete_portfolio = AsyncMock()
        portfolio_uc.delete_portfolio.return_value = True
        
        id = 2102
        res = await client.delete(f"/portfolios/{id}", cookies=self._get_authed_cookies())
        
        assert res.status_code == 204
        portfolio_uc.delete_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=id)
        
        # No token
        res = await client.delete("/portfolios/{id}")
        
        assert res.status_code == 401
        
        # Invalid ID
        res = await client.delete("/portfolios/invalid", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        # No portfolio to delete
        portfolio_uc.delete_portfolio.return_value = None
        portfolio_uc.delete_portfolio.reset_mock()
        
        res = await client.delete(f"/portfolios/{id}", cookies=self._get_authed_cookies())
        
        assert res.status_code == 404
        
    async def test_portfolio_get_valuation(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio = Portfolio(id=0, owner_id=user.id, name="foo", created_at=datetime.now())
        valuation_lines = [ ValuationLine(symbol="BTC",quantity=0.005, price=98_000, value=0.005*98_000), ValuationLine(symbol="ETH", quantity=0.08, price=38_000, value=0.08*38_000) ]
        portfolio_valuation = PortfolioValuation(portfolio_id=portfolio.id, total_value=78255, lines=valuation_lines, unknown_symbols=["ABC","DEF"])
        portfolio_uc.get_portfolio = AsyncMock()
        portfolio_uc.get_portfolio.return_value = portfolio
        portfolio_uc.compute_portfolio_valuation = AsyncMock()
        portfolio_uc.compute_portfolio_valuation.return_value = portfolio_valuation
        
        id = 5612
        res = await client.get(f"/portfolios/{id}/valuation", cookies=self._get_authed_cookies())
        data = res.json()
        
        assert res.status_code == 200
        assert data["portfolio_id"] == id
        assert data["total_value"] == portfolio_valuation.total_value
        assert isinstance(data["lines"], list)
        assert len(data["lines"]) ==  len(valuation_lines)
        for i in range(len(data["lines"])):
            assert data["lines"][i]["symbol"] == valuation_lines[i].symbol
            assert data["lines"][i]["quantity"] == valuation_lines[i].quantity
            assert data["lines"][i]["price"] == valuation_lines[i].price
            assert data["lines"][i]["value"] == valuation_lines[i].value
        assert isinstance(data["unknown_symbols"], list)
        assert len(data["unknown_symbols"]) == len(portfolio_valuation.unknown_symbols)
        for i in range(len(data["unknown_symbols"])):
            assert data["unknown_symbols"][i] == portfolio_valuation.unknown_symbols[i]
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=id)
        portfolio_uc.compute_portfolio_valuation.assert_awaited_once_with(portfolio_id=id)
        
        # No token
        res = await client.get(f"/portfolios/{id}/valuation")
        
        assert res.status_code == 401
        
        # Invalid ID
        res = await client.get("portfolios/invalid/valuation", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        # No portfolio found
        portfolio_uc.get_portfolio.return_value = None
        portfolio_uc.get_portfolio.reset_mock()
        portfolio_uc.compute_portfolio_valuation.reset_mock()
        
        res = await client.get(f"/portfolios/{id}/valuation", cookies=self._get_authed_cookies())
        
        assert res.status_code == 404
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=id)
        portfolio_uc.compute_portfolio_valuation.assert_not_awaited()
        
        
    # ----------------------- Assets route --------------------
    
    async def test_asset_add(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio = Portfolio(id=0, owner_id=user.id, name="foo", created_at=datetime.now())
        portfolio_uc.get_portfolio = AsyncMock()
        portfolio_uc.get_portfolio.return_value = portfolio
        asset = Asset(id=0, portfolio_id=portfolio.id, symbol="BTC", quantity=0.008, created_at=datetime.now())
        portfolio_uc.create_asset = AsyncMock()
        portfolio_uc.create_asset.return_value = asset
        
        payload = { "symbol" : "BTC", "quantity" : 0.0078 }
        res = await client.post("/portfolios/1007/assets", cookies=self._get_authed_cookies(),json=payload)
        data = res.json()
        
        assert res.status_code == 201
        assert isinstance(data, dict)
        assert data["id"] == asset.id
        assert data["portfolio_id"] == asset.portfolio_id
        assert data["symbol"] == asset.symbol
        assert data["quantity"] == asset.quantity
        assert data["created_at"] == asset.created_at.isoformat()
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=1007)
        portfolio_uc.create_asset.assert_awaited_once_with(payload=AssetCreate(symbol=payload["symbol"], quantity=payload["quantity"]), portfolio_id=1007)
        
        # No token 
        res = await client.post("/portfolios/0/assets", json=payload)
        
        assert res.status_code == 401
        
        # Invalid ID
        res = await client.post("/portfolios/invalid/assets", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
        # Invalid symbol
        payload["symbol"] = ""
        res = await client.post("/portfolios/0/assets", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
        payload["symbol"] = "a" * 17
        res = await client.post("/portfolios/0/assets", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
        payload["symbol"] = 8
        res = await client.post("/portfolios/0/assets", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
        # Invalid quantity
        payload["quantity"] = 0
        res = await client.post("/portfolios/0/assets", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
        payload["quantity"] = "test"
        res = await client.post("/portfolios/0/assets", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 422
        
        # Portfolio doesn't exist
        portfolio_uc.get_portfolio.reset_mock()
        portfolio_uc.get_portfolio.return_value = None
        portfolio_uc.create_asset.reset_mock()
        
        payload = { "symbol" : "BTC", "quantity" : 0.004 }
        res = await client.post("/portfolios/0/assets", cookies=self._get_authed_cookies(), json=payload)
        
        assert res.status_code == 404
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=0)
        portfolio_uc.create_asset.assert_not_awaited()
        
    async def test_asset_list(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio = Portfolio(id=0, owner_id=user.id, name="foo", created_at=datetime.now())
        portfolio_uc.get_portfolio = AsyncMock()
        portfolio_uc.get_portfolio.return_value = portfolio
        assets = [Asset(id=0, portfolio_id=portfolio.id, symbol="BTC", quantity=0.008, created_at=datetime.now()),Asset(id=1, portfolio_id=portfolio.id, symbol="ETH", quantity=0.04, created_at=datetime.now())]
        page_res = PaginationResponse(total_items=37,total_pages=2, current_page=1,items_per_page=20)
        portfolio_uc.list_assets_paginated = AsyncMock()
        portfolio_uc.list_assets_paginated.return_value = assets, page_res
        
        res = await client.get("/portfolios/877/assets", cookies=self._get_authed_cookies())
        data = res.json()
        
        assert res.status_code == 200
        assert isinstance(data, dict)
        assert isinstance(data["items"], list)
        assert len(data["items"]) == len(assets)
        for i in range(len(assets)):
            assert data["items"][i]["id"] == assets[i].id
            assert data["items"][i]["portfolio_id"] == assets[i].portfolio_id
            assert data["items"][i]["symbol"] == assets[i].symbol
            assert data["items"][i]["quantity"] == assets[i].quantity
            assert data["items"][i]["created_at"] == assets[i].created_at.isoformat()
        assert isinstance(data["pagination_response"], dict)
        assert data["pagination_response"]["total_items"] == page_res.total_items
        assert data["pagination_response"]["total_pages"] == page_res.total_pages
        assert data["pagination_response"]["current_page"] == page_res.current_page
        assert data["pagination_response"]["items_per_page"] == page_res.items_per_page
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=877)
        portfolio_uc.list_assets_paginated.assert_awaited_once_with(portfolio_id=877, pagination_request=PaginationRequest(page=1, items_per_page=20))
        
        # No token
        res = await client.get("/portfolios/45/assets")
        
        assert res.status_code == 401
        
        # Invalid ID
        res = await client.get("/portfolios/invalid/assets", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        # Custom page & items_per_page
        portfolio_uc.get_portfolio.reset_mock()
        portfolio_uc.list_assets_paginated.reset_mock()
        
        id, page, items_per_page = 84, 7, 45
        res = await client.get(f"/portfolios/{id}/assets?page={page}&items_per_page={items_per_page}", cookies=self._get_authed_cookies())
        
        assert res.status_code == 200
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=84)
        portfolio_uc.list_assets_paginated.assert_awaited_once_with(portfolio_id=84, pagination_request=PaginationRequest(items_per_page=items_per_page, page=page))
        
        # Invalid page
        res = await client.get(f"/portfolios/{id}/assets?page=foo", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        res = await client.get(f"/portfolios/{id}/assets?page=0", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        # Invalid items_per_page
        res = await client.get(f"/portfolios/{id}/assets?items_per_page=foo", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
        res = await client.get(f"/portfolios/{id}/assets?items_per_page=0", cookies=self._get_authed_cookies())
        
        assert res.status_code == 422
        
    async def test_asset_delete(self, rest_client : tuple[AsyncClient,AuthMgt, PortfolioMgt]):
        client, auth_uc, portfolio_uc = rest_client
        user = self.__set_authed_uc(auth_uc)
        portfolio = Portfolio(id=0, owner_id=user.id, name="foo", created_at=datetime.now())
        portfolio_uc.get_portfolio = AsyncMock()
        portfolio_uc.get_portfolio.return_value = portfolio
        portfolio_uc.delete_asset = AsyncMock()
        portfolio_uc.delete_asset.return_value = True
        
        p_id, a_id = 551, 48
        res = await client.delete(f"/portfolios/{p_id}/assets/{a_id}", cookies=self._get_authed_cookies())
        
        assert res.status_code == 204
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=p_id)
        portfolio_uc.delete_asset.assert_awaited_once_with(asset_id=a_id)
        
        # No token
        res = await client.delete(f"/portfolios/{p_id}/assets/{a_id}")
        
        assert res.status_code == 401
        
        # No portfolio
        portfolio_uc.get_portfolio.reset_mock()
        portfolio_uc.get_portfolio.return_value = None
        
        res = await client.delete(f"/portfolios/{p_id}/assets/{a_id}", cookies=self._get_authed_cookies())
        
        assert res.status_code == 404
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=p_id)
        
        # Delete not OK
        portfolio_uc.get_portfolio.reset_mock()
        portfolio_uc.get_portfolio.return_value = portfolio
        portfolio_uc.delete_asset.reset_mock()
        portfolio_uc.delete_asset.return_value = False
        
        res = await client.delete(f"/portfolios/{p_id}/assets/{a_id}", cookies=self._get_authed_cookies())
        
        assert res.status_code == 404
        portfolio_uc.get_portfolio.assert_awaited_once_with(owner_id=user.id, portfolio_id=p_id)
        portfolio_uc.delete_asset.assert_awaited_once_with(asset_id=a_id)