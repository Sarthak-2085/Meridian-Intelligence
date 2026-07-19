from __future__ import annotations
import json
import time
import logging
from typing import List

from schemas.models import Commodity, NewsItem, Prediction
from services.mock_data import mock_predictions
from services.ai_service import groq_client

logger = logging.getLogger("meridian")

_CACHE_TTL_SECONDS = 300  # 5 minutes
_cache: dict = {"data": None, "ts": 0.0}


def _base_prediction(base: Prediction) -> Prediction:
    """Sensible non-AI defaults so the frontend always has these fields filled."""
    direction = "Up" if base.bullish_probability >= 55 else ("Down" if base.bullish_probability <= 45 else "Neutral")
    risk = "High" if abs(base.bullish_probability - 50) >= 25 else ("Medium" if abs(base.bullish_probability - 50) >= 10 else "Low")
    base.predicted_direction = base.predicted_direction or direction  # type: ignore[assignment]
    base.confidence = base.confidence if base.confidence is not None else max(base.bullish_probability, base.bearish_probability)
    base.time_horizon = base.time_horizon or "7d"  # type: ignore[assignment]
    base.reasoning = base.reasoning or "Model has insufficient live signal for this asset; using baseline probability model."
    base.risk_level = base.risk_level or risk  # type: ignore[assignment]
    return base


def _enrich_one(base: Prediction, commodity: Commodity, related_news: List[NewsItem]) -> Prediction:
    if not groq_client:
        return _base_prediction(base)

    news_block = "\n".join(f"- {n.headline} (sentiment={n.market_sentiment or 'unknown'}, risk={n.geopolitical_risk or '?'})" for n in related_news[:5]) or "- No recent related headlines."

    prompt = f"""You are a commodity markets analyst. Given this snapshot, produce a short prediction.

Commodity: {commodity.name} ({commodity.symbol})
Current price: ${commodity.price}
24h change: {commodity.change_24h}%
7d change: {commodity.change_7d}%
Current sentiment: {commodity.sentiment}

Related recent news:
{news_block}

Respond ONLY with a JSON object, no preamble, no markdown fences:
{{
  "predicted_direction": "Up, Down, or Neutral",
  "confidence": integer 0-100,
  "time_horizon": "24h or 7d",
  "reasoning": "2-3 sentence explanation grounded in the data above",
  "risk_level": "Low, Medium, or High"
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        text = response.choices[0].message.content.strip()
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(text)

        base.predicted_direction = parsed.get("predicted_direction")
        base.confidence = int(parsed.get("confidence", base.bullish_probability))
        base.time_horizon = parsed.get("time_horizon", "7d")
        base.reasoning = parsed.get("reasoning")
        base.risk_level = parsed.get("risk_level")
        return base
    except Exception as e:
        logger.warning(f"Groq prediction failed for {commodity.symbol}, using fallback: {e}")
        return _base_prediction(base)


def live_predictions(commodities: List[Commodity], news: List[NewsItem]) -> List[Prediction]:
    """AI-enriched predictions per commodity, cached 5 min, always returns a full list."""
    now = time.time()
    if _cache["data"] and (now - _cache["ts"]) < _CACHE_TTL_SECONDS:
        return _cache["data"]

    try:
        baseline = mock_predictions(commodities)
        results = []
        for base, commodity in zip(baseline, commodities):
            related = [n for n in news if commodity.symbol in n.affected_commodities]
            results.append(_enrich_one(base, commodity, related))
    except Exception as e:
        logger.warning(f"Prediction engine failed entirely, falling back to mock: {e}")
        results = [_base_prediction(p) for p in mock_predictions(commodities)]

    _cache["data"] = results
    _cache["ts"] = now
    return results