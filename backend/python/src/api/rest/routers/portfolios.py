from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from src.domain.usecases.usecases import UseCases
from src.domain.usecases.portfoliomgt.portfoliomgt import PortfolioCreate
from src.api.rest.dependencies import get_usecases, get_current_user
from src.api.rest.schemas.common import ListResponse
from src.api.rest.schemas.portfolio import (
    PortfolioCreateRequest,
    PortfolioResponse,
)
from src.infrastructure.utils.pagination import PaginationRequest

router = APIRouter(prefix="/portfolios", tags=["portfolios"])


@router.post("", response_model=PortfolioResponse, status_code=201)
async def create_portfolio(
    payload: PortfolioCreateRequest,
    user=Depends(get_current_user),
    ucs:UseCases=Depends(get_usecases),
):
    uc = ucs.PortfolioMgt
    portfolio = await uc.create_portfolio(owner_id=user.id, payload=PortfolioCreate(name=payload.name))
    return PortfolioResponse(
        id=portfolio.id,
        owner_id=portfolio.owner_id,
        name=portfolio.name,
        created_at=portfolio.created_at,
    )


@router.get("", response_model=ListResponse[PortfolioResponse])
async def list_portfolios(
    page: int = Query(1, ge=1),
    items_per_page: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
    ucs:UseCases=Depends(get_usecases),
):
    uc = ucs.PortfolioMgt
    items, page_res = await uc.list_portfolios_paginated(owner_id=user.id, pagination_request=PaginationRequest(page=page, items_per_page=items_per_page))

    return ListResponse(
        items=[
            PortfolioResponse(
                id=p.id,
                owner_id=p.owner_id,
                name=p.name,
                created_at=p.created_at,
            )
            for p in items
        ],
        pagination_response=page_res
    )


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: int,
    user=Depends(get_current_user),
    ucs:UseCases=Depends(get_usecases),
):
    uc = ucs.PortfolioMgt
    
    p = await uc.get_portfolio(owner_id=user.id, portfolio_id=portfolio_id)
    if not p:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    return PortfolioResponse(
        id=p.id,
        owner_id=p.owner_id,
        name=p.name,
        created_at=p.created_at
    )

@router.delete("/{portfolio_id}", status_code=204)
async def delete_portfolio(
    portfolio_id: int,
    user=Depends(get_current_user),
    ucs:UseCases=Depends(get_usecases),
):
    uc = ucs.PortfolioMgt
    
    ok = await uc.delete_portfolio(owner_id=user.id, portfolio_id=portfolio_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return None
        