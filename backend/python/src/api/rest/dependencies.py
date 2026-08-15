from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, Request

from src.domain.aggregates.auth.user import User
from src.domain.usecases.usecases import UseCases
from src.infrastructure.config.settings import Settings


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_usecases(request: Request) -> UseCases:
    return request.app.state.usecases


async def get_current_user(request: Request) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    uc = request.app.state.usecases.auth_mgt
    user = await uc.get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user


SettingsDep = Annotated[Settings, Depends(get_settings)]
UseCasesDep = Annotated[UseCases, Depends(get_usecases)]
CurrentUser = Annotated[User, Depends(get_current_user)]
