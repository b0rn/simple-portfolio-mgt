from __future__ import annotations
from typing import Optional
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta
import uuid
from jose import jwt
from src.infrastructure.config.settings import settings
from src.infrastructure.datastore.sqlalchemy.base import session_scope
from src.infrastructure.datastore.sqlalchemy.models.user import User as UserModel
from passlib.context import CryptContext
from ..authdataservice import AuthDataService
from src.domain.aggregates.auth.user import User
from src.domain.aggregates.exceptions.auth import EmailAlreadyExistsError, InvalidCredentialsError

class LocalAuthDataService(AuthDataService):
    
    def __init__(self) -> None:
        super().__init__()
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
        self.JWT_ALG = "HS256"

    async def health_check(self) -> bool:
        if not settings.jwt_secret:
            return False
        async with session_scope() as db:
            try:
                await db.execute(select(UserModel).limit(1))
                return True
            except Exception:
                return False

    async def register(self, email: str, password: str) -> tuple[User, str]:
        hash_password = self.__hash_password(password)
        model = UserModel(email=email, password_hash=hash_password)
        try:
            async with session_scope() as db:
                db.add(model)
                await db.commit()
                await db.refresh(model)
        except IntegrityError as e:
            if "already exists" in str(e):
                raise EmailAlreadyExistsError
        user = User(id=model.id, email=model.email, created_at=model.created_at)
        token = self.__create_access_token(user.id)
        return user, token
    
    async def login(self, email: str, password: str) -> tuple[User, str]:
        async with session_scope() as db:
            res = await db.execute(
                select(UserModel).where(UserModel.email == email)
            )
            model = res.scalar_one_or_none()
            if not model or not self.__verify_password(password, model.password_hash):
                raise InvalidCredentialsError
            user = User(id=model.id, email=model.email, created_at=model.created_at)
            token = self.__create_access_token(user.id)
            return user, token
    
    async def get_user_from_token(self, access_token: str) -> Optional[User]:
        if not settings.jwt_secret:
            raise ValueError("JWT secret is not set")
        try:
            data = jwt.decode(access_token, settings.jwt_secret, algorithms=[self.JWT_ALG])
            sub = data.get("sub")
            if not sub:
                return None
            user_id = uuid.UUID(sub)
        except Exception:
            return None

        async with session_scope() as db:
            res = await db.execute(
                select(UserModel).where(UserModel.id == user_id)
            )
            model = res.scalar_one_or_none()
            if not model:
                return None
            return User(id=model.id, email=model.email, created_at=model.created_at)
    
    def __hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def __verify_password(self, password: str, password_hash: str) -> bool:
        return self.pwd_context.verify(password, password_hash)
    
    def __create_access_token(self, user_id: uuid.UUID) -> str:
        if not settings.jwt_secret:
            raise ValueError("JWT secret is not set")
        now = datetime.now(timezone.utc)
        exp = now + timedelta(minutes=settings.jwt_expires_minutes)
        payload = {"sub": str(user_id), "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
        return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")