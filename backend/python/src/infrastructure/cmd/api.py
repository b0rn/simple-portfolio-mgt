from __future__ import annotations

from src.domain.usecases.usecases import UseCases
from src.api.rest.app import create_app
from src.infrastructure.config.settings import build_settings

settings = build_settings()

# Build usecases
usecases = UseCases.build(settings=settings) 

# Create FastAPI app
app = create_app(settings=settings,usecases=usecases)
