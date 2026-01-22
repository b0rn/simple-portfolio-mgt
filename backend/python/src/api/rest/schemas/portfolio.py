from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PortfolioCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class PortfolioPatchRequest(BaseModel):
    name: Optional[str] = Field(min_length=1, max_length=100, default=None)


class PortfolioResponse(BaseModel):
    id: int
    owner_id: uuid.UUID
    name: str
    created_at: datetime
