from __future__ import annotations
from abc import ABC,abstractmethod
from typing import Optional
from src.domain.aggregates.auth.user import User

class AuthDataService(ABC):
    
    @abstractmethod
    async def health_check(self) -> bool:
        pass
    
    # ----------------- User Methods -----------------
    @abstractmethod
    async def register(self, email: str, password: str) -> tuple[User, str]:
        pass
    
    @abstractmethod
    async def login(self, email: str, password: str) -> tuple[User, str]:
        pass
    
    @abstractmethod
    async def get_user_from_token(self, access_token: str) -> Optional[User]:
        pass