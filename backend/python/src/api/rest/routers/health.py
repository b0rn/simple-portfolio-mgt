from __future__ import annotations
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from src.api.rest.dependencies import get_usecases
from src.domain.usecases.usecases import UseCases
from src.api.rest.schemas.health import Health
from fastapi.encoders import jsonable_encoder

router = APIRouter(tags=["health"])


@router.get("/health", response_model=Health, status_code=200)
async def get_health(ucs: UseCases = Depends(get_usecases)):
    auth_health = await ucs.auth_mgt.health_check()
    portfolio_health = await ucs.portfolio_mgt.health_check()

    health = Health(
        errors=auth_health.errors + portfolio_health.errors,
        warnings=auth_health.warnings + portfolio_health.warnings,
    )

    if len(auth_health.errors) > 0 or len(portfolio_health.errors) > 0:
        json_content = jsonable_encoder(health)
        return JSONResponse(status_code=500, content=json_content)

    return health
