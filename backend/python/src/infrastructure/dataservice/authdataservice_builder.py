from __future__ import annotations

from src.infrastructure.config.settings import Settings
from .authdataservice import AuthDataService


def build_auth_dataservice(settings: Settings) -> AuthDataService:
    # Local imports prevent circular import at module import time
    if settings is None:
        raise Exception("settings is not set")
    if settings.auth_mode == "local":
        from src.infrastructure.dataservice.auth_local.local import LocalAuthDataService
        return LocalAuthDataService(settings=settings)

    from src.infrastructure.dataservice.auth_supabase.supabase import SupabaseAuthDataService
    return SupabaseAuthDataService()
