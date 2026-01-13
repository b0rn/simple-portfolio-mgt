from __future__ import annotations

from src.domain.usecases.usecases import UseCases
from src.api.rest.app import create_app

# Build usecases
usecases = UseCases.build() 

# Create FastAPI app
app = create_app(usecases=usecases)
