from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from src.domain.usecases.usecases import UseCases
from src.domain.usecases.portfoliomgt.portfoliomgt import AssetCreate
from src.api.rest.dependencies import get_usecases, get_current_user
from src.api.rest.schemas.asset import AssetCreateRequest, AssetResponse
from src.api.rest.schemas.common import ListResponse
from src.infrastructure.utils.pagination import PaginationRequest

router = APIRouter(tags=["assets"])


@router.get("/prices", response_model=dict[str, float], status_code=200)
def get_prices(user=Depends(get_current_user), ucs: UseCases = Depends(get_usecases)):
    uc = ucs.PortfolioMgt
    return uc.get_assets_prices()


@router.post(
    "/portfolios/{portfolio_id}/assets", response_model=AssetResponse, status_code=201
)
async def add_asset(
    portfolio_id: int,
    payload: AssetCreateRequest,
    user=Depends(get_current_user),
    ucs: UseCases = Depends(get_usecases),
):
    # Ensure portfolio belongs to user
    p = await ucs.PortfolioMgt.get_portfolio(
        owner_id=user.id, portfolio_id=portfolio_id
    )
    if not p:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    a = await ucs.PortfolioMgt.create_asset(
        payload=AssetCreate(
            symbol=payload.symbol,
            quantity=payload.quantity,
        ),
        portfolio_id=portfolio_id,
    )

    return AssetResponse(
        id=a.id,
        portfolio_id=a.portfolio_id,
        symbol=a.symbol,
        quantity=a.quantity,
        created_at=a.created_at,
    )


@router.get(
    "/portfolios/{portfolio_id}/assets", response_model=ListResponse[AssetResponse]
)
async def list_assets(
    portfolio_id: int,
    page: int = Query(1, ge=1),
    items_per_page: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
    ucs: UseCases = Depends(get_usecases),
):
    # Effectively checking if the asset's portfolio is owned by the user
    p = await ucs.PortfolioMgt.get_portfolio(
        owner_id=user.id, portfolio_id=portfolio_id
    )
    if not p:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    items, page_res = await ucs.PortfolioMgt.list_assets_paginated(
        portfolio_id=portfolio_id,
        pagination_request=PaginationRequest(page=page, items_per_page=items_per_page),
    )

    return ListResponse(
        items=[
            AssetResponse(
                id=a.id,
                portfolio_id=a.portfolio_id,
                symbol=a.symbol,
                quantity=a.quantity,
                created_at=a.created_at,
            )
            for a in items
        ],
        pagination_response=page_res,
    )


@router.delete("/portfolios/{portfolio_id}/assets/{asset_id}", status_code=204)
async def delete_asset(
    portfolio_id: int,
    asset_id: int,
    user=Depends(get_current_user),
    ucs: UseCases = Depends(get_usecases),
):
    p = await ucs.PortfolioMgt.get_portfolio(
        owner_id=user.id, portfolio_id=portfolio_id
    )
    if not p:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    ok = await ucs.PortfolioMgt.delete_asset(asset_id=asset_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Asset not found")
    return None
