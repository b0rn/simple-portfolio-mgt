from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx

from src.domain.aggregates.auth.user import User
from src.domain.aggregates.health.health import Health
from src.infrastructure.config.settings import Settings
from ..authdataservice import AuthDataService
from src.domain.aggregates.exceptions.auth import InvalidCredentialsError
from .exceptions import (
    SupabaseUrlNotSetError,
    AnonKeyNotSetError,
    NoAccessTokenError,
    TokenInvalidError,
    CantFetchUserError,
    EmailConfirmationRequiredError,
    SignupFailedError
)


class SupabaseAuthDataService(AuthDataService):
    """
    Uses Supabase Auth REST API (email+password).
    This provider DOES NOT support get_by_email without Admin API.
    """

    def __init__(self, settings: Settings, client: Optional[httpx.AsyncClient]) -> None:
        super().__init__()
        self._settings = settings
        self._client = client if client is not None else httpx.AsyncClient(timeout=10.0)

    def _base_headers(self) -> dict[str, str]:
        if not self._settings.supabase_anon_key:
            raise AnonKeyNotSetError
        return {
            "apikey": self._settings.supabase_anon_key,
            "Content-Type": "application/json",
        }

    async def health_check(self) -> Health:
        errors: list[str] = []
        warnings: list[str] = []
        if not self._settings.supabase_url:
            errors.append(str(SupabaseUrlNotSetError))
        if not self._settings.supabase_anon_key:
            errors.append(str(AnonKeyNotSetError))
        return Health(errors=errors, warnings=warnings)

    async def register(self, email: str, password: str) -> tuple[User, str]:
        if not self._settings.supabase_url:
            raise SupabaseUrlNotSetError
        url = f"{self._settings.supabase_url.rstrip('/')}/auth/v1/signup"

        r = await self._client.post(
            url,
            headers=self._base_headers(),
            json={"email": email, "password": password},
        )

        if r.status_code >= 400:
            # Supabase returns structured errors; keep it simple for now
            raise SignupFailedError

        data = r.json()
        access_token = data.get("access_token")
        if not access_token:
            # This commonly happens if email confirmation is enabled
            raise EmailConfirmationRequiredError

        user = await self.get_user_from_token(access_token)
        if not user:
            raise CantFetchUserError

        return user, access_token

    async def login(self, email: str, password: str) -> tuple[User, str]:
        if not self._settings.supabase_url:
            raise SupabaseUrlNotSetError
        url = f"{self._settings.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password"

        r = await self._client.post(
            url,
            headers=self._base_headers(),
            json={"email": email, "password": password},
        )

        if r.status_code >= 400:
            raise InvalidCredentialsError

        data = r.json()
        access_token = data.get("access_token")
        if not access_token:
            raise NoAccessTokenError

        user = await self.get_user_from_token(access_token)
        if not user:
            raise TokenInvalidError

        return user, access_token

    async def get_user_from_token(self, access_token: str) -> Optional[User]:
        if not self._settings.supabase_url:
            raise SupabaseUrlNotSetError
        url = f"{self._settings.supabase_url.rstrip('/')}/auth/v1/user"

        r = await self._client.get(
            url,
            headers={**self._base_headers(), "Authorization": f"Bearer {access_token}"},
        )

        if r.status_code >= 400:
            return None

        data = r.json()
        created_at_raw = data.get("created_at")
        try:
            created_at = datetime.fromisoformat(created_at_raw)
        except Exception:
            created_at = datetime.now(timezone.utc)
        return User(
            id=uuid.UUID(data["id"]),
            email=data["email"],
            created_at=created_at,
        )
