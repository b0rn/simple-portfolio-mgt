from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class AssetCreateRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=16)
    quantity: float = Field(gt=0)


class AssetResponse(BaseModel):
    id: int
    portfolio_id: int
    symbol: str
    quantity: float
    created_at: datetime
