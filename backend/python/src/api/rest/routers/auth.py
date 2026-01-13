from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response

from src.infrastructure.config.settings import settings
from src.domain.usecases.usecases import UseCases
from src.api.rest.dependencies import get_usecases,get_current_user
from src.api.rest.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    MeResponse,
    UserResponse,
)
from src.domain.aggregates.exceptions.auth import EmailAlreadyExistsError

router = APIRouter(prefix="/auth", tags=["auth"])

def _set_auth_cookie(resp: Response, token: str) -> None:
    if settings.cookie_domain:
        resp.set_cookie(
            "access_token",
            token,
            httponly=True,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
            max_age=settings.jwt_expires_minutes * 60,
            path="/",
            domain=settings.cookie_domain,
        )
    else:
        resp.set_cookie(
            "access_token",
            token,
            httponly=True,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
            max_age=settings.jwt_expires_minutes * 60,
            path="/",
        )



def _clear_auth_cookie(resp: Response) -> None:
    if settings.cookie_domain:
        resp.delete_cookie(key="access_token", path="/", domain=settings.cookie_domain)
    else:
        resp.delete_cookie(key="access_token", path="/")

@router.post("/register", response_model=MeResponse)
async def register(payload: RegisterRequest, resp: Response, ucs : UseCases = Depends(get_usecases)):
    uc = ucs.AuthMgt
    try:
        user, token = await uc.register(payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except EmailAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    _set_auth_cookie(resp, token)
    return MeResponse(user=UserResponse(id=user.id, email=user.email, created_at=user.created_at))


@router.post("/login", response_model=MeResponse)
async def login(payload: LoginRequest, resp: Response, ucs : UseCases = Depends(get_usecases)):
    uc = ucs.AuthMgt
    try:
        user, token = await uc.login(payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

    _set_auth_cookie(resp, token)
    return MeResponse(user=UserResponse(id=user.id, email=user.email, created_at=user.created_at))


@router.post("/logout")
async def logout(resp: Response):
    _clear_auth_cookie(resp)
    return {"status": "ok"}


@router.get("/me", response_model=MeResponse)
async def me(user=Depends(get_current_user)):
    return MeResponse(user=UserResponse(id=user.id, email=user.email, created_at=user.created_at))
