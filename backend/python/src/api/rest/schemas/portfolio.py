from __future__ import annotations

import uuid
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class PortfolioCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class PortfolioResponse(BaseModel):
    id: int
    owner_id: uuid.UUID
    name: str
    created_at: datetime
