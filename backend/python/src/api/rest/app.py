from __future__ import annotations

from contextlib import asynccontextmanager
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.infrastructure.config.settings import Settings
from src.infrastructure.observability import shutdown_observability
from src.infrastructure.observability.setup import instrument_app
from src.infrastructure.observability.middleware import RequestLoggingMiddleware
from src.domain.usecases.usecases import UseCases
from src.api.rest.routers.health import router as health_router
from src.api.rest.routers.auth import router as auth_router
from src.api.rest.routers.portfolios import router as portfolios_router
from src.api.rest.routers.assets import router as assets_router

logger = structlog.get_logger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    shutdown_observability()


def create_app(settings: Settings, usecases: UseCases) -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        lifespan=lifespan,
    )

    app.state.settings = settings
    app.state.usecases = usecases

    logger.info("cors_configured", origins=settings.cors_origins)

    # CORS for Next.js + cookies
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request logging middleware (runs after CORS)
    app.add_middleware(RequestLoggingMiddleware)

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(portfolios_router)
    app.include_router(assets_router)

    # OTel FastAPI instrumentation (spans + metrics per route)
    if settings.otel_enabled:
        instrument_app(app)

    return app
