from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True, slots=True)
class Asset:
    id: int
    portfolio_id: int
    symbol: str
    quantity: float
    buy_price: float
    created_at: datetime