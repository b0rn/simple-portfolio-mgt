from __future__ import annotations

from src.infrastructure.config.settings import build_settings
from src.infrastructure.observability import setup_observability
from src.domain.usecases.usecases import UseCases
from src.api.rest.app import create_app

settings = build_settings()

# Initialize observability (traces, metrics, logs) before anything else
setup_observability(settings)

# Build usecases
usecases = UseCases.build(settings=settings)

# Create FastAPI app
app = create_app(settings=settings, usecases=usecases)
