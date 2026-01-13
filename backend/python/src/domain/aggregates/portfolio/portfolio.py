from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import uuid


@dataclass(frozen=True, slots=True)
class Portfolio:
    id: int
    owner_id: uuid.UUID
    name: str
    created_at: datetime
