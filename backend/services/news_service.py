from __future__ import annotations
import time
import json
import logging
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
import feedparser

from schemas.models import NewsItem
from services.mock_data import mock_news, _NEWS_THUMBS
from services.ai_service import groq_client

logger = logging.getLogger("meridian")

_CACHE_TTL_SECONDS = 600  # 10 minutes
_cache: dict = {"data": None, "ts": 0.0}

_QUERIES = [
    "geopolitics OR war OR sanctions",
    "OPEC OR crude oil OR energy prices",
    "commodities OR wheat OR gold OR natural gas",
    "trade war OR tariffs OR shipping",
    "central bank OR inflation OR interest rates",
]

_RSS_BASE = "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"

_COMMODITY_KEYWORDS = {
    "XAU": ["gold"],
    "XAG": ["silver"],
    "WTI": ["oil", "crude", "opec", "petroleum"],
    "NG": ["natural gas", "gas prices", "lng"],
    "ZW": ["wheat", "grain"],
    "ZC": ["corn", "maize"],
}


def _guess_commodities(headline: str) -> List[str]:
    lower = headline.lower()
    hits = [sym for sym, kws in _COMMODITY_KEYWORDS.items() if any(kw in lower for kw in kws)]
    return hits or ["WTI"]  # default bucket so it still shows up somewhere


def _guess_impact(headline: str) -> str:
    lower = headline.lower()
    if any(w in lower for w in ["war", "attack", "strike", "sanctions", "invasion", "crisis"]):
        return "high"
    if any(w in lower for w in ["talks", "deal", "cut", "rise", "fall", "opec"]):
        return "medium"
    return "low"


def _fetch_rss() -> List[NewsItem]:
    items: List[NewsItem] = []
    seen_titles = set()

    for i, query in enumerate(_QUERIES):
        url = _RSS_BASE.format(query=query.replace(" ", "+"))
        feed = feedparser.parse(url)
        for entry in feed.entries[:6]:
            headline = getattr(entry, "title", "").strip()
            if not headline or headline in seen_titles:
                continue
            seen_titles.add(headline)

            source = ""
            if hasattr(entry, "source") and hasattr(entry.source, "title"):
                source = entry.source.title
            elif " - " in headline:
                source = headline.rsplit(" - ", 1)[-1]

            published = getattr(entry, "published_parsed", None)
            if published:
                ts = datetime(*published[:6], tzinfo=timezone.utc).isoformat()
            else:
                ts = datetime.now(timezone.utc).isoformat()

            uid = hashlib.md5(headline.encode()).hexdigest()[:10]
            items.append(
                NewsItem(
                    id=f"n-{uid}",
                    headline=headline,
                    source=source or "Google News",
                    category="Geopolitics",
                    region="Global",
                    timestamp=ts,
                    impact=_guess_impact(headline),  # type: ignore[arg-type]
                    thumbnail=_NEWS_THUMBS[i % len(_NEWS_THUMBS)],
                    affected_commodities=_guess_commodities(headline),
                    url=getattr(entry, "link", None),
                )
            )

    return items[:20]


def _enrich_one(item: NewsItem) -> NewsItem:
    """Ask Groq for a summary + structured tags for one headline. Fails soft."""
    if not groq_client:
        return item

    prompt = f"""Analyze this news headline for a commodity markets dashboard.

Headline: "{item.headline}"
Source: {item.source}

Respond ONLY with a JSON object, no preamble, no markdown fences:
{{
  "ai_summary": "2-3 sentence plain-English summary of likely context",
  "event_type": "one or two words, e.g. Sanctions, Military Conflict, Trade Policy, Central Bank",
  "affected_countries": ["list", "of", "country", "names"],
  "affected_commodities": ["subset of: XAU, XAG, WTI, NG, ZW, ZC based on relevance"],
  "market_sentiment": "Bullish, Bearish, or Neutral for commodity prices broadly",
  "geopolitical_risk": integer 0-100,
  "short_market_impact": "1-2 sentence market impact"
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=350,
        )
        text = response.choices[0].message.content.strip()
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(text)

        item.ai_summary = parsed.get("ai_summary")
        item.event_type = parsed.get("event_type")
        item.affected_countries = parsed.get("affected_countries", [])
        if parsed.get("affected_commodities"):
            item.affected_commodities = parsed["affected_commodities"]
        item.market_sentiment = parsed.get("market_sentiment")
        item.geopolitical_risk = parsed.get("geopolitical_risk")
        item.short_market_impact = parsed.get("short_market_impact")
    except Exception as e:
        logger.warning(f"Groq enrichment failed for '{item.headline[:50]}...': {e}")
        # sensible defaults so the frontend always has something to show
        item.ai_summary = item.ai_summary or item.headline
        item.market_sentiment = item.market_sentiment or "Neutral"
        item.geopolitical_risk = item.geopolitical_risk if item.geopolitical_risk is not None else 50
        item.short_market_impact = item.short_market_impact or "Impact unclear - insufficient data."

    return item


def live_news() -> List[NewsItem]:
    """Fetch live news from Google News RSS, cached 10 min, with AI enrichment.
    Falls back to mock_news() if RSS totally fails."""
    now = time.time()
    if _cache["data"] and (now - _cache["ts"]) < _CACHE_TTL_SECONDS:
        return _cache["data"]

    try:
        items = _fetch_rss()
    except Exception as e:
        logger.warning(f"RSS fetch failed entirely, falling back to mock news: {e}")
        items = []

    if not items:
        return _cache["data"] or mock_news()

    items = [_enrich_one(item) for item in items[:10]] + items[10:]

    _cache["data"] = items
    _cache["ts"] = now
    return items