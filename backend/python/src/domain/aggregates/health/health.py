from __future__ import annotations
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Health:
    errors: list[str]
    warnings: list[str]
