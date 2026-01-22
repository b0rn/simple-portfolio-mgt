"""
Integration tests for the Supabase auth dataservice
"""
from __future__ import annotations
import pytest
from uuid import UUID
from src.infrastructure.dataservice.auth_supabase.supabase import SupabaseAuthDataService

@pytest.mark.integration
@pytest.mark.asyncio
class TestSupabase:
    """ Test auth dataservice : Supabase """
    
    def _set_settings(self, auth_supabase : SupabaseAuthDataService):
        auth_supabase._settings.supabase_url = "https://test.test"
        auth_supabase._settings.supabase_anon_key = "anonkey"
        
    
    async def test_health_check(self, dataservice_auth_supabase : tuple[SupabaseAuthDataService, str, UUID, str, str]):
        ds, _ , _ , _, _ = dataservice_auth_supabase
        res = await ds.health_check()
        assert len(res.errors) == 0
        assert len(res.warnings) == 0
        
    async def test_register(self, dataservice_auth_supabase : tuple[SupabaseAuthDataService, str, UUID, str, str]):
        ds, access_token, id, email, created_at = dataservice_auth_supabase
        password = "password123!"
        user, token = await ds.register(email, password)
        
        assert user.id == id
        assert user.email == email
        assert user.created_at == created_at
        assert token == access_token
        
    async def test_login(self, dataservice_auth_supabase : tuple[SupabaseAuthDataService, str, UUID, str, str]):
        ds, access_token, id, email, created_at = dataservice_auth_supabase
        user, token = await ds.login(email, "test")
        
        assert user.id == id
        assert user.email == email
        assert user.created_at == created_at
        assert token == access_token
        
    async def test_get_user_from_token(self,dataservice_auth_supabase : tuple[SupabaseAuthDataService, str, UUID, str, str]):
        ds, access_token, id, email, created_at = dataservice_auth_supabase
        user = await ds.get_user_from_token(access_token=access_token)
        
        assert user is not None
        assert user.id == id
        assert user.email == email
        assert user.created_at == created_at
        