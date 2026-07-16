from __future__ import annotations
import random
from datetime import datetime, timezone, timedelta
from typing import List

from schemas.models import Commodity, NewsItem, CountryRisk, Mover, Prediction

# ---------------------------------------------------------------------------
# Commodities
# ---------------------------------------------------------------------------
_BASE_COMMODITIES = [
    {"id": "gold",       "name": "Gold",        "symbol": "XAU", "price": 2412.50, "unit": "USD/oz",   "icon": "🥇"},
    {"id": "silver",     "name": "Silver",      "symbol": "XAG", "price": 30.14,   "unit": "USD/oz",   "icon": "🥈"},
    {"id": "oil",        "name": "Crude Oil",   "symbol": "WTI", "price": 78.62,   "unit": "USD/bbl",  "icon": "🛢️"},
    {"id": "natgas",     "name": "Natural Gas", "symbol": "NG",  "price": 2.87,    "unit": "USD/MMBtu","icon": "🔥"},
    {"id": "wheat",      "name": "Wheat",       "symbol": "ZW",  "price": 5.82,    "unit": "USD/bu",   "icon": "🌾"},
    {"id": "corn",       "name": "Corn",        "symbol": "ZC",  "price": 4.31,    "unit": "USD/bu",   "icon": "🌽"},
]


def sparkline(base: float, points: int = 28, vol: float = 0.02) -> List[float]:
    """Random-walk sparkline anchored around `base`."""
    values = []
    v = base * (1 + random.uniform(-vol * 3, vol * 3))
    for _ in range(points):
        v = v * (1 + random.uniform(-vol, vol))
        values.append(round(v, 4))
    return values


def mock_commodities() -> List[Commodity]:
    out = []
    for c in _BASE_COMMODITIES:
        change_24h = round(random.uniform(-3.5, 3.5), 2)
        change_7d = round(change_24h + random.uniform(-4.0, 4.0), 2)
        sentiment: str = "bullish" if change_24h > 0.6 else ("bearish" if change_24h < -0.6 else "neutral")
        out.append(
            Commodity(
                **c,
                change_24h=change_24h,
                change_7d=change_7d,
                ai_impact_score=random.randint(38, 92),
                sentiment=sentiment,
                sparkline=sparkline(c["price"]),
            )
        )
    return out


# ---------------------------------------------------------------------------
# News
# ---------------------------------------------------------------------------
_NEWS_THUMBS = [
    "https://images.unsplash.com/photo-1663427929917-333d88949f7a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwzfHxnbG9iYWwlMjBnZW9wb2xpdGljYWwlMjBzdW1taXQlMjBkYXJrfGVufDB8fHx8MTc4MzA5OTA5NHww&ixlib=rb-4.1.0&q=85",
    "https://images.pexels.com/photos/30475898/pexels-photo-30475898.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "https://images.unsplash.com/photo-1621697944804-d0a393f7e01a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHNoaXBwaW5nJTIwY29udGFpbmVycyUyMHBvcnQlMjBuaWdodHxlbnwwfHx8fDE3ODMwOTkwOTR8MA&ixlib=rb-4.1.0&q=85",
]

_NEWS_TEMPLATES = [
    ("OPEC+ signals output cut to defend $80 floor", "Reuters",         "Energy",   "MENA",         "high",   ["WTI", "NG"]),
    ("Gulf tensions push safe-haven bid; Gold nears $2,450", "Bloomberg","Markets",  "Middle East",  "high",   ["XAU", "XAG"]),
    ("Baltic Dry Index jumps 4% as Red Sea reroutes deepen", "FT",       "Shipping", "Europe",       "medium", ["WTI"]),
    ("Ukraine grain corridor extension in doubt after strike", "AP",     "Agri",     "Eastern EU",   "high",   ["ZW", "ZC"]),
    ("US CPI cooler than expected; DXY slips, metals rally",  "WSJ",     "Macro",    "North America","medium", ["XAU", "XAG"]),
    ("China stimulus package targets manufacturing PMI",       "SCMP",    "Macro",    "Asia",         "medium", ["WTI", "ZC"]),
    ("Nigeria oil output disruption on pipeline sabotage",     "AFP",     "Energy",   "Africa",       "high",   ["WTI"]),
    ("Euro-area natgas storage above 5-year avg heading winter","Bloomberg","Energy", "Europe",     "low",    ["NG"]),
    ("India wheat export ban extended into Q2",                "Nikkei",  "Agri",     "South Asia",   "medium", ["ZW"]),
    ("Fed minutes hint at pause; risk-on across commodities",  "CNBC",    "Macro",    "North America","medium", ["XAU", "WTI"]),
]


def mock_news() -> List[NewsItem]:
    now = datetime.now(timezone.utc)
    items = []
    for i, (headline, source, cat, region, impact, comms) in enumerate(_NEWS_TEMPLATES):
        ts = now - timedelta(minutes=random.randint(2, 60) * (i + 1))
        items.append(
            NewsItem(
                id=f"n-{i+1:03d}",
                headline=headline,
                source=source,
                category=cat,
                region=region,
                timestamp=ts.isoformat(),
                impact=impact,  # type: ignore[arg-type]
                thumbnail=_NEWS_THUMBS[i % len(_NEWS_THUMBS)],
                affected_commodities=comms,
            )
        )
    return items


# ---------------------------------------------------------------------------
# Countries
# ---------------------------------------------------------------------------
_BASE_COUNTRIES = [
    ("US", "United States",   38.0,    -97.0,  32, 28, ["Fed meeting outcome",       "CPI print in line"],        ["XAU", "WTI"]),
    ("RU", "Russia",           61.5,    105.3,  84, 76, ["Sanctions expanded",       "Ruble volatility"],         ["WTI", "NG", "ZW"]),
    ("CN", "China",            35.9,    104.2,  62, 55, ["Stimulus package unveiled","PMI rebounds"],             ["WTI", "ZC", "XAU"]),
    ("SA", "Saudi Arabia",     23.9,     45.1,  58, 46, ["OPEC+ meeting Thursday",   "Aramco Q results"],         ["WTI"]),
    ("IR", "Iran",             32.4,     53.7,  88, 71, ["Strait of Hormuz tensions","Nuclear talks stalled"],    ["WTI"]),
    ("IL", "Israel",           31.0,     34.9,  79, 52, ["Regional escalation risk", "Emergency budget passed"],  ["WTI", "XAU"]),
    ("UA", "Ukraine",          48.4,     31.2,  86, 78, ["Grain corridor uncertain", "Infra strikes reported"],   ["ZW", "ZC"]),
    ("VE", "Venezuela",         6.4,    -66.6,  74, 82, ["Oil output revised down",  "Sanctions relief debated"], ["WTI"]),
    ("NG", "Nigeria",           9.1,      8.7,  71, 64, ["Pipeline sabotage",        "Naira devaluation"],        ["WTI"]),
    ("IN", "India",            20.6,     78.9,  44, 40, ["Wheat export ban extended","GST cuts proposed"],        ["ZW"]),
    ("BR", "Brazil",          -14.2,    -51.9,  46, 43, ["Real ag season outlook",   "Central bank on hold"],     ["ZC", "ZW"]),
    ("DE", "Germany",          51.2,     10.4,  30, 38, ["Manufacturing PMI weak",   "Gas storage 92% full"],     ["NG"]),
    ("AU", "Australia",       -25.3,    133.8,  22, 30, ["RBA holds rates",          "Iron ore exports steady"],  ["XAG"]),
    ("TR", "Turkey",           39.0,     35.2,  65, 68, ["Lira intervention",        "Central bank shake-up"],    ["XAU"]),
    ("EG", "Egypt",            26.8,     30.8,  57, 60, ["Suez traffic normalising", "Currency reforms"],         ["WTI"]),
]


def mock_countries() -> List[CountryRisk]:
    out = []
    for code, name, lat, lng, pol, eco, events, comms in _BASE_COUNTRIES:
        pol_j = max(0, min(100, pol + random.randint(-4, 4)))
        eco_j = max(0, min(100, eco + random.randint(-4, 4)))
        overall = int(round((pol_j * 0.55) + (eco_j * 0.45)))
        out.append(
            CountryRisk(
                code=code, name=name, lat=lat, lng=lng,
                political_risk=pol_j, economic_risk=eco_j, overall_risk=overall,
                recent_events=events, affected_commodities=comms,
            )
        )
    return out


# ---------------------------------------------------------------------------
# Movers + predictions
# ---------------------------------------------------------------------------
def mock_top_movers(commodities: List[Commodity]) -> List[Mover]:
    ranked = sorted(commodities, key=lambda c: abs(c.change_24h), reverse=True)[:5]
    return [
        Mover(symbol=c.symbol, name=c.name, change=c.change_24h, direction="up" if c.change_24h >= 0 else "down")
        for c in ranked
    ]


def mock_predictions(commodities: List[Commodity]) -> List[Prediction]:
    out = []
    for c in commodities:
        bull = random.randint(35, 78)
        bear = 100 - bull
        if bull >= 68:   signal = "strong_buy"
        elif bull >= 55: signal = "buy"
        elif bull >= 45: signal = "neutral"
        elif bull >= 32: signal = "sell"
        else:            signal = "strong_sell"
        out.append(
            Prediction(
                symbol=c.symbol, name=c.name, horizon_days=30,
                bullish_probability=bull, bearish_probability=bear,
                trend=sparkline(c.price, points=30, vol=0.015),
                signal=signal,  # type: ignore[arg-type]
                correlations=[
                    {"with": "DXY", "value": round(random.uniform(-0.9, 0.4), 2)},
                    {"with": "10Y", "value": round(random.uniform(-0.6, 0.6), 2)},
                    {"with": "VIX", "value": round(random.uniform(-0.2, 0.8), 2)},
                ],
            )
        )
    return out
