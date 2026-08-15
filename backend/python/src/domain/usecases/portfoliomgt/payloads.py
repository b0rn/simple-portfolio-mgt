from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class PortfolioCreate:
    name: str


@dataclass(frozen=True, slots=True)
class PortfolioUpdate:
    name: str | None


@dataclass(frozen=True, slots=True)
class AssetCreate:
    symbol: str
    quantity: float
