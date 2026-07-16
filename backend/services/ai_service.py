from __future__ import annotations
import json
import random
import logging
from typing import List
from groq import Groq

import config
from schemas.models import NewsItem, Commodity, Insight

logger = logging.getLogger("meridian")

groq_client = Groq(api_key=config.GROQ_API_KEY) if config.GROQ_API_KEY else None

_INSIGHTS_POOL = [
    ("Safe-haven rotation strengthening", "Correlation between gold and 10Y real yields inverting again — a classic risk-off tell. Model favours further upside near $2,470.", "MACRO"),
    ("Energy premium re-pricing",        "Middle East tail risk is not yet priced into 3-month WTI options skew. Model probability of a $5 spike within 30d: 42%.",           "ENERGY"),
    ("Grain stress cluster forming",     "Ukraine corridor uncertainty overlapping with India export ban creates a wheat squeeze setup. Watch $6.20 as breakout trigger.",     "AGRI"),
    ("Dollar softness broadens metals",  "Cooler US CPI + Fed pause narrative is unlocking coordinated moves across XAU/XAG. Silver beta screening well.",                   "FX"),
    ("Shipping cost feedthrough",        "Baltic Dry Index breakout implies +1.4% cost pressure on refined product prices over a 6-week lag.",                                "LOGISTICS"),
]


def mock_insights() -> List[Insight]:
    picks = random.sample(_INSIGHTS_POOL, 4)
    return [
        Insight(id=f"i-{i+1}", title=t, detail=d, confidence=random.randint(62, 92), tag=tag)
        for i, (t, d, tag) in enumerate(picks)
    ]


def ai_insights(news: List[NewsItem], commodities: List[Commodity]) -> List[Insight]:
    """Ask Groq (Llama) to derive insights from the current news + commodity snapshot.
    Falls back to the mock pool if no API key is configured or the call fails.
    """
    if not groq_client:
        return mock_insights()

    news_block = "\n".join(f"- {n.headline} ({n.source}, {n.region}, impact={n.impact})" for n in news[:8])
    price_block = "\n".join(f"- {c.name} ({c.symbol}): ${c.price} 24h={c.change_24h}% sentiment={c.sentiment}" for c in commodities)

    prompt = f"""You are a market intelligence analyst. Given the following live news headlines and commodity prices, produce exactly 4 concise insights connecting geopolitical events to commodity price moves.

NEWS:
{news_block}

COMMODITY PRICES:
{price_block}

Respond ONLY with a JSON array of exactly 4 objects, no preamble, no markdown fences. Each object must have:
- "title": short headline, max 8 words
- "detail": 1-2 sentence analysis connecting a specific news item to a specific commodity move
- "confidence": integer 55-95
- "tag": one word category, e.g. ENERGY, MACRO, AGRI, FX, LOGISTICS
"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
        )
        text = response.choices[0].message.content.strip()
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(text)
        return [
            Insight(
                id=f"i-{i+1}",
                title=item["title"],
                detail=item["detail"],
                confidence=int(item.get("confidence", 70)),
                tag=item.get("tag", "MACRO"),
            )
            for i, item in enumerate(parsed[:4])
        ]
    except Exception as e:
        logger.warning(f"Groq insight generation failed, falling back to mock: {e}")
        return mock_insights()
