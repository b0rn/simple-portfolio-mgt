"""
Unit tests for authMgt usecase
"""
from __future__ import annotations
import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from datetime import datetime

from src.domain.usecases.authmgt.authmgt import AuthMgt
from src.infrastructure.dataservice.authdataservice import AuthDataService
from src.domain.aggregates.health.health import Health
from src.domain.aggregates.auth.user import User


@pytest.mark.unit
@pytest.mark.asyncio
class TestAuthMgtUseCase:
    """Test authMgt usecase"""

    def __get_uc(self, mock_auth_dataservice: AuthDataService):
        return AuthMgt(auth_data_service=mock_auth_dataservice)

    async def test_health_check(self, mock_auth_dataservice: AuthDataService):
        health = Health(errors=["test1"], warnings=["foo"])
        mock_auth_dataservice.health_check = AsyncMock()
        mock_auth_dataservice.health_check.return_value = health
        uc = self.__get_uc(mock_auth_dataservice=mock_auth_dataservice)

        res = await uc.health_check()

        assert res == health
        mock_auth_dataservice.health_check.assert_called_once()

    async def test_register(self, mock_auth_dataservice: AuthDataService):
        user = User(id=uuid4(), email="foo@bar.re", created_at=datetime.now())
        passwd = "password123!"
        mock_auth_dataservice.register = AsyncMock()
        mock_auth_dataservice.register.return_value = user
        uc = self.__get_uc(mock_auth_dataservice=mock_auth_dataservice)

        res = await uc.register(email=user.email, password=passwd)

        assert res == user
        mock_auth_dataservice.register.assert_awaited_once_with(user.email, passwd)

    async def test_login(self, mock_auth_dataservice: AuthDataService):
        user = User(id=uuid4(), email="foo@bar.re", created_at=datetime.now())
        passwd, token = "password123!", "my_token"
        mock_auth_dataservice.login = AsyncMock()
        mock_auth_dataservice.login.return_value = user, token
        uc = self.__get_uc(mock_auth_dataservice=mock_auth_dataservice)

        res_user, res_token = await uc.login(email=user.email, password=passwd)

        assert res_user == user
        assert res_token == token
        mock_auth_dataservice.login.assert_awaited_once_with(user.email, passwd)

    async def test_get_user_from_token(self, mock_auth_dataservice: AuthDataService):
        user = User(id=uuid4(), email="foo@bar.re", created_at=datetime.now())
        token = "my_token"
        mock_auth_dataservice.get_user_from_token = AsyncMock()
        mock_auth_dataservice.get_user_from_token.return_value = user
        uc = self.__get_uc(mock_auth_dataservice=mock_auth_dataservice)

        res = await uc.get_user_from_token(token)

        assert res == user
        mock_auth_dataservice.get_user_from_token.assert_awaited_once_with(token)
