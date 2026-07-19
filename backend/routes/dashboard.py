from __future__ import annotations
from fastapi import APIRouter
from datetime import datetime, timezone
import json
import random
import logging

from schemas.models import DashboardPayload
from services.mock_data import mock_countries, mock_top_movers, mock_commodities
from services.price_service import live_commodities
from services.news_service import live_news
from services.ai_service import ai_insights
from database import save_snapshot

logger = logging.getLogger("meridian")
router = APIRouter()


@router.get("/dashboard", response_model=DashboardPayload)
def dashboard_route():
    commodities = live_commodities() or mock_commodities()
    news = live_news()  # cached + AI-enriched; shared with /news route
    payload = DashboardPayload(
        commodities=commodities,
        news=news,
        countries=mock_countries(),
        insights=ai_insights(news, commodities),
        global_risk_index=random.randint(48, 74),
        top_movers=mock_top_movers(commodities),
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
    try:
        save_snapshot("dashboard", json.loads(payload.model_dump_json()))
    except Exception as e:
        logger.warning(f"snapshot save failed: {e}")
    return payload