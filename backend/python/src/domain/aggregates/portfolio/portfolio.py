from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Portfolio:
    id: int
    owner_id: uuid.UUID
    name: str
    created_at: datetime
