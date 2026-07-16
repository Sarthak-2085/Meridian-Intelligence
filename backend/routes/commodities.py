from __future__ import annotations
from fastapi import APIRouter, HTTPException
from typing import List

from schemas.models import Commodity, CommodityDetail
from services.mock_data import mock_commodities, mock_countries, mock_news, sparkline

router = APIRouter()


@router.get("/commodities", response_model=List[Commodity])
def commodities_route():
    return mock_commodities()


@router.get("/commodities/{symbol}", response_model=CommodityDetail)
def commodity_detail_route(symbol: str):
    all_c = mock_commodities()
    match = next((c for c in all_c if c.symbol.upper() == symbol.upper() or c.id.upper() == symbol.upper()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Commodity {symbol} not found")

    exposed = [country.name for country in mock_countries() if match.symbol in country.affected_commodities]
    related = [n for n in mock_news() if match.symbol in n.affected_commodities]

    return CommodityDetail(
        **match.model_dump(),
        history_1d=sparkline(match.price, points=24, vol=0.006),
        history_7d=sparkline(match.price, points=28, vol=0.015),
        history_30d=sparkline(match.price, points=30, vol=0.02),
        history_1y=sparkline(match.price, points=52, vol=0.05),
        exposed_countries=exposed,
        related_news=related,
    )
