from __future__ import annotations
from typing import Optional
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta
import uuid
from jose import jwt
from src.infrastructure.config.settings import Settings
from src.infrastructure.datastore.sqlalchemy.base import session_scope
from src.infrastructure.datastore.sqlalchemy.models.user import User as UserModel
from argon2 import PasswordHasher
from ..authdataservice import AuthDataService
from src.domain.aggregates.auth.user import User
from src.domain.aggregates.exceptions.auth import EmailAlreadyExistsError, InvalidCredentialsError
from src.domain.aggregates.health.health import Health

class LocalAuthDataService(AuthDataService):
    
    def __init__(self, settings: Settings) -> None:
        super().__init__()
        self.settings = settings
        self.password_hasher = PasswordHasher()
        self.JWT_ALG = "HS256"

    async def health_check(self) -> Health:
        errors : list[str] = []
        warnings : list[str] = []
        if not self.settings.jwt_secret:
            errors.append("JWT_SECRET is not set")
        async with session_scope() as db:
            try:
                await db.execute(select(UserModel).limit(1))
                return Health(errors=errors,warnings=warnings)
            except Exception:
                errors.append("could not connect to database")
                return Health(errors=errors,warnings=warnings)

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
        if not self.settings.jwt_secret:
            raise ValueError("JWT secret is not set")
        try:
            data = jwt.decode(access_token, self.settings.jwt_secret, algorithms=[self.JWT_ALG])
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
    
    async def delete_user(self, email : str) -> bool:
        async with session_scope() as db:
            res = await db.execute(
                delete(UserModel)
                .where(UserModel.email == email)
            )
            await db.commit()
            return res.rowcount > 0
    
    def __hash_password(self, password: str) -> str:
        return self.password_hasher.hash(password)
    
    def __verify_password(self, password: str, password_hash: str) -> bool:
        try:
            self.password_hasher.verify(password_hash, password)
            return True
        except:
            return False
    
    def __create_access_token(self, user_id: uuid.UUID) -> str:
        if not self.settings.jwt_secret:
            raise ValueError("JWT secret is not set")
        now = datetime.now(timezone.utc)
        exp = now + timedelta(minutes=self.settings.jwt_expires_minutes)
        payload = {"sub": str(user_id), "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
        return jwt.encode(payload, self.settings.jwt_secret, algorithm="HS256")