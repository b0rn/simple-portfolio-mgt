from __future__ import annotations
from typing import Optional
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class PortfolioCreate:
    name: str


@dataclass(frozen=True, slots=True)
class PortfolioUpdate:
    name: Optional[str]


@dataclass(frozen=True, slots=True)
class AssetCreate:
    symbol: str
    quantity: float
