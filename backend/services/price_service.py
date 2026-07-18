from __future__ import annotations
import time
import logging
from typing import List
import yfinance as yf

from schemas.models import Commodity

logger = logging.getLogger("meridian")

# yfinance futures tickers mapped to our commodity metadata
_TICKERS = [
    {"id": "gold",   "name": "Gold",        "symbol": "XAU", "ticker": "GC=F", "unit": "USD/oz",    "icon": "🥇"},
    {"id": "silver", "name": "Silver",      "symbol": "XAG", "ticker": "SI=F", "unit": "USD/oz",    "icon": "🥈"},
    {"id": "oil",    "name": "Crude Oil",   "symbol": "WTI", "ticker": "CL=F", "unit": "USD/bbl",   "icon": "🛢️"},
    {"id": "natgas", "name": "Natural Gas", "symbol": "NG",  "ticker": "NG=F", "unit": "USD/MMBtu", "icon": "🔥"},
    {"id": "wheat",  "name": "Wheat",       "symbol": "ZW",  "ticker": "ZW=F", "unit": "USD/bu",    "icon": "🌾"},
    {"id": "corn",   "name": "Corn",        "symbol": "ZC",  "ticker": "ZC=F", "unit": "USD/bu",    "icon": "🌽"},
]

_CACHE_TTL_SECONDS = 300  # 5 minutes
_cache: dict = {"data": None, "ts": 0.0}


def _sentiment(change_24h: float) -> str:
    if change_24h > 0.6:
        return "bullish"
    if change_24h < -0.6:
        return "bearish"
    return "neutral"


def _fetch_one(meta: dict) -> Commodity | None:
    try:
        hist = yf.Ticker(meta["ticker"]).history(period="1mo", interval="1d")
        closes = [round(float(v), 4) for v in hist["Close"].dropna().tolist()]
        if len(closes) < 2:
            return None

        price = closes[-1]
        prev_day = closes[-2]
        prev_week = closes[-8] if len(closes) >= 8 else closes[0]

        change_24h = round((price - prev_day) / prev_day * 100, 2)
        change_7d = round((price - prev_week) / prev_week * 100, 2)

        return Commodity(
            id=meta["id"],
            name=meta["name"],
            symbol=meta["symbol"],
            price=price,
            change_24h=change_24h,
            change_7d=change_7d,
            ai_impact_score=min(95, max(30, int(50 + abs(change_24h) * 8))),
            sentiment=_sentiment(change_24h),
            sparkline=closes[-28:] if len(closes) >= 28 else closes,
            unit=meta["unit"],
            icon=meta["icon"],
        )
    except Exception as e:
        logger.warning(f"yfinance fetch failed for {meta['ticker']}: {e}")
        return None


def live_commodities() -> List[Commodity]:
    """Fetch real commodity prices from Yahoo Finance, cached for a few minutes.
    Falls back to the previous cached value per-symbol if a fetch fails,
    and to nothing (caller should fall back to mock) if the cache is empty."""
    now = time.time()
    if _cache["data"] and (now - _cache["ts"]) < _CACHE_TTL_SECONDS:
        return _cache["data"]

    results = []
    for meta in _TICKERS:
        c = _fetch_one(meta)
        if c:
            results.append(c)

    if not results:
        # total failure - keep serving stale cache if we have one
        return _cache["data"] or []

    _cache["data"] = results
    _cache["ts"] = now
    return results