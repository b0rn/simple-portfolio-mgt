from __future__ import annotations

from src.infrastructure.config.settings import settings
from .authdataservice import AuthDataService

def build_auth_dataservice() -> AuthDataService:
    # Local imports prevent circular import at module import time
    if settings.auth_mode == "local":
        from src.infrastructure.dataservice.auth_local.local import LocalAuthDataService
        return LocalAuthDataService()

    from src.infrastructure.dataservice.auth_supabase.supabase import SupabaseAuthDataService
    return SupabaseAuthDataService()
