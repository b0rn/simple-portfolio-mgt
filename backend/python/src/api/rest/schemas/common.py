from __future__ import annotations
from typing import List, TypeVar
from pydantic import BaseModel, Field
from src.infrastructure.utils.pagination import PaginationResponse

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Page number")
    items_per_page: int = Field(
        20,
        ge=1,
        le=100,
        description="Number of items per page",
    )


class ListResponse[T](BaseModel):
    items: List[T]
    pagination_response: PaginationResponse
