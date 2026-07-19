from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Literal, Optional


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
    url: Optional[str] = None
    # AI enrichment (optional - old consumers unaffected)
    ai_summary: Optional[str] = None
    event_type: Optional[str] = None
    affected_countries: List[str] = Field(default_factory=list)
    market_sentiment: Optional[Literal["Bullish", "Bearish", "Neutral"]] = None
    geopolitical_risk: Optional[int] = None
    short_market_impact: Optional[str] = None


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


class CommodityDetail(Commodity):
    history_1d: List[float]
    history_7d: List[float]
    history_30d: List[float]
    history_1y: List[float]
    exposed_countries: List[str]
    related_news: List[NewsItem]


class Settings(BaseModel):
    watchlist: List[str] = Field(default_factory=lambda: ["XAU", "WTI", "NG"])
    risk_threshold: int = 65
    default_region: str = "All"
    updated_at: Optional[str] = None