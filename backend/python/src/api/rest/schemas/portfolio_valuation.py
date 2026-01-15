from __future__ import annotations
from pydantic import BaseModel

class PortfolioValuationLine(BaseModel):
    symbol: str
    quantity: float
    price: float
    value: float

class PortfolioValuationResponse(BaseModel):
    portfolio_id: int
    total_value: float
    lines: list["PortfolioValuationLine"]
    unknown_symbols: list[str]