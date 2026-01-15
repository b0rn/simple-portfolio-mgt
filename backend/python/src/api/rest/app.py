from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infrastructure.config.settings import Settings
from src.domain.usecases.usecases import UseCases
from src.api.rest.routers.auth import router as auth_router
from src.api.rest.routers.portfolios import router as portfolios_router
from src.api.rest.routers.assets import router as assets_router

def create_app(settings : Settings, usecases : UseCases) -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
    )
    
    app.state.settings = settings
    app.state.usecases = usecases

    print(f"CORS is setup for {settings.cors_origins}")

    # CORS for Next.js + cookies
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(portfolios_router)
    app.include_router(assets_router)

    return app
