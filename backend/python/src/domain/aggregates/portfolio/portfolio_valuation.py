from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class PortfolioValuation:
    portfolio_id: int
    total_value: float
    lines: list["ValuationLine"]
    unknown_symbols: list[str]
    
@dataclass(frozen=True, slots=True)
class ValuationLine:
    symbol: str
    quantity: float
    price: float
    value: float