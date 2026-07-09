"""
Meridian - Geopolitical Market Intelligence Backend
FastAPI + SQLite. Mock/illustrative data only. No paid APIs.
"""
from __future__ import annotations
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sqlite3
import json
import random
import os
import logging

# ---------------------------------------------------------------------------
# App bootstrap
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).parent
DB_PATH = ROOT_DIR / "meridian.db"

app = FastAPI(title="Meridian Intelligence API", version="0.1.0")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("meridian")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# SQLite - minimal cache for the illustrative mock payload
# ---------------------------------------------------------------------------
def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS snapshot (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


def save_snapshot(key: str, value: dict) -> None:
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO snapshot (key, value, updated_at) VALUES (?, ?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            (key, json.dumps(value), datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class Commodity(BaseModel):
    id: str
    name: str
    symbol: str
    price: float
    change_24h: float
    change_7d: float
    ai_impact_score: int
    sentiment: Literal["bullish", "bearish", "neutral"]
    sparkline: List[float]
    unit: str
    icon: str


class NewsItem(BaseModel):
    id: str
    headline: str
    source: str
    category: str
    region: str
    timestamp: str
    impact: Literal["high", "medium", "low"]
    thumbnail: str
    affected_commodities: List[str]


class CountryRisk(BaseModel):
    code: str
    name: str
    lat: float
    lng: float
    political_risk: int
    economic_risk: int
    overall_risk: int
    recent_events: List[str]
    affected_commodities: List[str]


class Insight(BaseModel):
    id: str
    title: str
    detail: str
    confidence: int
    tag: str


class Mover(BaseModel):
    symbol: str
    name: str
    change: float
    direction: Literal["up", "down"]


class DashboardPayload(BaseModel):
    commodities: List[Commodity]
    news: List[NewsItem]
    countries: List[CountryRisk]
    insights: List[Insight]
    global_risk_index: int
    top_movers: List[Mover]
    updated_at: str


class Prediction(BaseModel):
    symbol: str
    name: str
    horizon_days: int
    bullish_probability: int
    bearish_probability: int
    trend: List[float]
    signal: Literal["strong_buy", "buy", "neutral", "sell", "strong_sell"]
    correlations: List[dict]


# ---------------------------------------------------------------------------
# Mock generators (deterministic-ish with jitter each request)
# ---------------------------------------------------------------------------
_BASE_COMMODITIES = [
    {"id": "gold",       "name": "Gold",        "symbol": "XAU", "price": 2412.50, "unit": "USD/oz",   "icon": "🥇"},
    {"id": "silver",     "name": "Silver",      "symbol": "XAG", "price": 30.14,   "unit": "USD/oz",   "icon": "🥈"},
    {"id": "oil",        "name": "Crude Oil",   "symbol": "WTI", "price": 78.62,   "unit": "USD/bbl",  "icon": "🛢️"},
    {"id": "natgas",     "name": "Natural Gas", "symbol": "NG",  "price": 2.87,    "unit": "USD/MMBtu","icon": "🔥"},
    {"id": "wheat",      "name": "Wheat",       "symbol": "ZW",  "price": 5.82,    "unit": "USD/bu",   "icon": "🌾"},
    {"id": "corn",       "name": "Corn",        "symbol": "ZC",  "price": 4.31,    "unit": "USD/bu",   "icon": "🌽"},
]


def _sparkline(base: float, points: int = 28, vol: float = 0.02) -> List[float]:
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
                sparkline=_sparkline(c["price"]),
            )
        )
    return out


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


_BASE_COUNTRIES = [
    # (code, name, lat, lng, base_political, base_economic, events, commodities)
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
                trend=_sparkline(c.price, points=30, vol=0.015),
                signal=signal,  # type: ignore[arg-type]
                correlations=[
                    {"with": "DXY", "value": round(random.uniform(-0.9, 0.4), 2)},
                    {"with": "10Y", "value": round(random.uniform(-0.6, 0.6), 2)},
                    {"with": "VIX", "value": round(random.uniform(-0.2, 0.8), 2)},
                ],
            )
        )
    return out


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api.get("/")
def root():
    return {"service": "meridian", "version": "0.1.0", "status": "ok"}


@api.get("/commodities", response_model=List[Commodity])
def commodities_route():
    return mock_commodities()


@api.get("/news", response_model=List[NewsItem])
def news_route():
    return mock_news()


@api.get("/countries", response_model=List[CountryRisk])
def countries_route():
    return mock_countries()


@api.get("/predictions", response_model=List[Prediction])
def predictions_route():
    return mock_predictions(mock_commodities())


class Settings(BaseModel):
    watchlist: List[str] = Field(default_factory=lambda: ["XAU", "WTI", "NG"])
    risk_threshold: int = 65
    default_region: str = "All"
    updated_at: Optional[str] = None


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


@api.get("/settings", response_model=Settings)
def get_settings():
    return _load_settings()


@api.put("/settings", response_model=Settings)
def put_settings(patch: Settings):
    payload = patch.model_dump(exclude={"updated_at"})
    save_snapshot("settings", payload)
    return _load_settings()


@api.get("/countries/{code}", response_model=CountryRisk)
def country_by_code(code: str):
    for c in mock_countries():
        if c.code.upper() == code.upper():
            return c
    raise HTTPException(status_code=404, detail=f"Country {code} not found")


@api.get("/dashboard", response_model=DashboardPayload)
def dashboard_route():
    commodities = mock_commodities()
    payload = DashboardPayload(
        commodities=commodities,
        news=mock_news(),
        countries=mock_countries(),
        insights=mock_insights(),
        global_risk_index=random.randint(48, 74),
        top_movers=mock_top_movers(commodities),
        updated_at=datetime.now(timezone.utc).isoformat(),
    )
    try:
        save_snapshot("dashboard", json.loads(payload.model_dump_json()))
    except Exception as e:
        logger.warning(f"snapshot save failed: {e}")
    return payload


app.include_router(api)


@app.on_event("startup")
def _startup():
    init_db()
    logger.info("Meridian API ready.")
