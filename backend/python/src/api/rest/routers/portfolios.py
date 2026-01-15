from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from src.domain.usecases.usecases import UseCases
from src.domain.usecases.portfoliomgt.payloads import PortfolioCreate, PortfolioUpdate
from src.api.rest.dependencies import get_usecases, get_current_user
from src.api.rest.schemas.common import ListResponse
from src.api.rest.schemas.portfolio import (
    PortfolioCreateRequest,
    PortfolioPatchRequest,
    PortfolioResponse,
)
from src.api.rest.schemas.portfolio_valuation import PortfolioValuationLine, PortfolioValuationResponse
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

@router.patch("/{portfolio_id}", status_code=200, response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: int,
    payload: PortfolioPatchRequest,
    user=Depends(get_current_user),
    ucs:UseCases=Depends(get_usecases)
):
    uc = ucs.PortfolioMgt
    
    p = await uc.update_portfolio(owner_id=user.id, portfolio_id=portfolio_id, payload=PortfolioUpdate(name=payload.name))
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

@router.get("/{portfolio_id}/valuation", status_code=200, response_model=PortfolioValuationResponse)
async def get_portfolio_valutation(
    portfolio_id: int,
    user=Depends(get_current_user),
    ucs:UseCases=Depends(get_usecases),
):
    uc = ucs.PortfolioMgt
    
    portfolio = await uc.get_portfolio(owner_id=user.id, portfolio_id=portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    portfolio_valuation = await uc.compute_portfolio_valuation(portfolio_id=portfolio_id)
    return PortfolioValuationResponse(
        portfolio_id=portfolio_id,
        total_value=portfolio_valuation.total_value,
        lines=[PortfolioValuationLine(symbol=l.symbol,quantity=l.quantity,price=l.price,value=l.value) for l in portfolio_valuation.lines],
        unknown_symbols=portfolio_valuation.unknown_symbols
    )