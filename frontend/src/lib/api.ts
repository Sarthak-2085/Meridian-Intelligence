const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export type Commodity = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change_24h: number;
  change_7d: number;
  ai_impact_score: number;
  sentiment: "bullish" | "bearish" | "neutral";
  sparkline: number[];
  unit: string;
  icon: string;
};

export type NewsItem = {
  id: string;
  headline: string;
  source: string;
  category: string;
  region: string;
  timestamp: string;
  impact: "high" | "medium" | "low";
  thumbnail: string;
  affected_commodities: string[];
};

export type CountryRisk = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  political_risk: number;
  economic_risk: number;
  overall_risk: number;
  recent_events: string[];
  affected_commodities: string[];
};

export type Insight = {
  id: string;
  title: string;
  detail: string;
  confidence: number;
  tag: string;
};

export type DashboardPayload = {
  commodities: Commodity[];
  news: NewsItem[];
  countries: CountryRisk[];
  insights: Insight[];
  global_risk_index: number;
  top_movers: {
    symbol: string;
    name: string;
    change: number;
    direction: "up" | "down";
  }[];
  updated_at: string;
};

export type CommodityDetail = Commodity & {
  history_1d: number[];
  history_7d: number[];
  history_30d: number[];
  history_1y: number[];
  exposed_countries: string[];
  related_news: NewsItem[];
};

export type Prediction = {
  symbol: string;
  name: string;
  horizon_days: number;
  bullish_probability: number;
  bearish_probability: number;
  trend: number[];
  signal: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell";
  correlations: { with: string; value: number }[];
};

export type SettingsPayload = {
  watchlist: string[];
  risk_threshold: number;
  default_region: string;
  updated_at?: string | null;
};

async function put<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  dashboard: () => get<DashboardPayload>("/api/dashboard"),
  news: () => get<NewsItem[]>("/api/news"),
  commodities: () => get<Commodity[]>("/api/commodities"),
  commodityDetail: (symbol: string) =>
    get<CommodityDetail>(`/api/commodities/${symbol}`),
  countries: () => get<CountryRisk[]>("/api/countries"),
  country: (code: string) => get<CountryRisk>(`/api/countries/${code}`),
  predictions: () => get<Prediction[]>("/api/predictions"),
  settings: () => get<SettingsPayload>("/api/settings"),
  saveSettings: (s: SettingsPayload) =>
    put<SettingsPayload>("/api/settings", s),
};
