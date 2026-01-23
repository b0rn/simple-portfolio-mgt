from __future__ import annotations
from dataclasses import dataclass
from math import ceil


@dataclass(frozen=True, slots=True)
class PaginationRequest:
    items_per_page: int
    page: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.items_per_page


@dataclass(frozen=True, slots=True)
class PaginationResponse:
    total_items: int
    total_pages: int
    current_page: int
    items_per_page: int


def create_pagination_response(
    total_items: int, pagination_request: PaginationRequest
) -> PaginationResponse:
    total_pages = ceil(total_items / pagination_request.items_per_page)
    return PaginationResponse(
        total_items=total_items,
        total_pages=total_pages,
        current_page=pagination_request.page,
        items_per_page=pagination_request.items_per_page,
    )
