from __future__ import annotations
from fastapi import APIRouter, HTTPException
from typing import List
import json

from schemas.models import NewsItem, CountryRisk, Prediction, Settings
from services.mock_data import mock_countries, mock_commodities, mock_predictions
from services.news_service import live_news
from database import get_conn, save_snapshot

router = APIRouter()


@router.get("/")
def root():
    return {"service": "meridian", "version": "0.1.0", "status": "ok"}


@router.get("/news", response_model=List[NewsItem])
def news_route():
    return live_news()


@router.get("/countries", response_model=List[CountryRisk])
def countries_route():
    return mock_countries()


@router.get("/countries/{code}", response_model=CountryRisk)
def country_by_code(code: str):
    for c in mock_countries():
        if c.code.upper() == code.upper():
            return c
    raise HTTPException(status_code=404, detail=f"Country {code} not found")


@router.get("/predictions", response_model=List[Prediction])
def predictions_route():
    return mock_predictions(mock_commodities())


def _load_settings() -> Settings:
    conn = get_conn()
    try:
        row = conn.execute("SELECT value, updated_at FROM snapshot WHERE key = ?", ("settings",)).fetchone()
        if not row:
            return Settings()
        data = json.loads(row["value"])
        data["updated_at"] = row["updated_at"]
        return Settings(**data)
    finally:
        conn.close()


@router.get("/settings", response_model=Settings)
def get_settings():
    return _load_settings()


@router.put("/settings", response_model=Settings)
def put_settings(patch: Settings):
    payload = patch.model_dump(exclude={"updated_at"})
    save_snapshot("settings", payload)
    return _load_settings()