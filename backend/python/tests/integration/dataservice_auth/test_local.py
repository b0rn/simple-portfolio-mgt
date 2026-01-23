"""
Integration tests for the local auth dataservice
"""

from __future__ import annotations
import pytest
from src.infrastructure.dataservice.auth_local.local import LocalAuthDataService
from src.domain.aggregates.auth.user import User
from src.domain.aggregates.exceptions.auth import (
    EmailAlreadyExistsError,
    InvalidCredentialsError,
)


@pytest.mark.integration
@pytest.mark.asyncio
class TestLocal:
    """Test auth dataservice : local"""

    async def test_health_check(self, dataservice_auth_local: LocalAuthDataService):
        res = await dataservice_auth_local.health_check()
        assert len(res.errors) == 0
        assert len(res.warnings) == 0

    async def test_register(self, dataservice_auth_local: LocalAuthDataService):
        email, password = "test@test.com", "foobar"
        user, token = await dataservice_auth_local.register(
            email=email, password=password
        )

        assert user.id is not None
        assert str(user.id) != ""
        assert token != ""

        # Register with same email
        with pytest.raises(EmailAlreadyExistsError):
            await dataservice_auth_local.register(email, password)

        await dataservice_auth_local.delete_user(email)

    async def test_login(
        self,
        dataservice_auth_local: LocalAuthDataService,
        dataservice_auth_local_user: tuple[User, str, str],
    ):
        user, password, _ = dataservice_auth_local_user
        read, token = await dataservice_auth_local.login(user.email, password)

        assert read.id == user.id
        assert read.email == user.email
        assert token != ""

        # Invalid password
        with pytest.raises(InvalidCredentialsError):
            await dataservice_auth_local.login(user.email, "foo")

    async def test_get_user_from_token(
        self,
        dataservice_auth_local: LocalAuthDataService,
        dataservice_auth_local_user: tuple[User, str, str],
    ):
        user, _, token = dataservice_auth_local_user
        read_user = await dataservice_auth_local.get_user_from_token(token)

        assert read_user is not None
        assert read_user.id == user.id
        assert read_user.email == user.email

        # Invalid token
        read_user = await dataservice_auth_local.get_user_from_token("foobar")

        assert read_user is None
