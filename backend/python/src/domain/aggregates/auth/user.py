from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime
import uuid


@dataclass(frozen=True, slots=True)
class User:
    id: uuid.UUID
    email: str
    created_at: datetime
