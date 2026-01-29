from __future__ import annotations
from fastapi import Request, HTTPException
from src.infrastructure.config.settings import Settings
from src.domain.usecases.usecases import UseCases


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_usecases(request: Request) -> UseCases:
    return request.app.state.usecases


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    uc = request.app.state.usecases.auth_mgt
    user = await uc.get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
