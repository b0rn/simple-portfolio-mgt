from __future__ import annotations
from typing import Optional
from src.domain.aggregates.auth.user import User
from src.domain.aggregates.health.health import Health
from src.infrastructure.dataservice.authdataservice import AuthDataService

class AuthMgt:
    def __init__(self, auth_data_service : AuthDataService) -> None:
        self.auth_data_service = auth_data_service
        
    async def health_check(self) -> Health:
        return await self.auth_data_service.health_check()

    async def register(self, email: str, password : str) -> tuple[User, str]:
        return await self.auth_data_service.register(email, password)
    
    async def login(self, email: str, password: str) -> tuple[User, str]:
        return await self.auth_data_service.login(email, password)

    async def get_user_from_token(self, token: str) -> Optional[User]:
        return await self.auth_data_service.get_user_from_token(token)