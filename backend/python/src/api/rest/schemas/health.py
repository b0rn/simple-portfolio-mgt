from __future__ import annotations
from pydantic import BaseModel

class Health(BaseModel):
    errors : list[str]
    warnings : list[str]