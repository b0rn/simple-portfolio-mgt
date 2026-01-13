from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class PortfolioCreate:
    name: str

@dataclass(frozen=True, slots=True)
class AssetCreate:
    symbol: str
    quantity: float
    buy_price: float    