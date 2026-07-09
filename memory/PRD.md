# Meridian — Geopolitical Market Intelligence Dashboard

## Problem Statement
Build a production-ready starter for an AI-powered Geopolitical Market Intelligence Dashboard. Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui patterns + Recharts + React Leaflet + Framer Motion frontend. FastAPI + SQLite backend. Rich mock JSON, no paid APIs, no auth.

## Architecture
- Frontend: /app/frontend — Next.js 15 App Router, TypeScript, port 3000
- Backend: /app/backend — FastAPI + SQLite (meridian.db), port 8001, /api prefix
- Design: dark glassmorphism, editorial (Cormorant Garamond serif + Manrope + JetBrains Mono), gold accent #D4AF37

## Phase 1 — SHIPPED (Feb 2026)
- App shell: sidebar, navbar with global search + live UTC clock, dark theme, grain texture
- Dashboard page (/) with:
  - Interactive world map (React Leaflet, CartoDB Dark Matter) w/ pulsing risk markers + legend
  - Live news feed (10 mock items, impact badges, thumbnails, affected commodities)
  - 6 commodity cards (Gold/Silver/Oil/Natural Gas/Wheat/Corn) with sparklines, 24h/7d change, AI impact score
  - AI Insights panel (4 curated insights with confidence bars + tags)
  - Global Risk Meter (animated gauge, -120°→+120° arc, color-coded)
  - Top Movers list (5 ranked by |change|)
- Placeholder shells for /news, /commodities, /countries, /predictions, /settings
- Backend endpoints: /api/dashboard, /api/commodities, /api/news, /api/countries, /api/predictions
- SQLite snapshot cache for dashboard payload
- Framer Motion staggered entrance animations, hover transitions
- Loading skeletons + error states with retry

## Phase 2 — Deferred
- Dedicated News Feed page (search, region/impact filters)
- Commodity Analysis detail per commodity (technicals, multi-timeframe, exposure heatmap)
- Country Analysis: clickable map → political/economic risk breakdown + events + affected commodities
- Predictions page: probability gauges, bullish/bearish, correlation charts
- Settings (watchlists, thresholds) persisted to SQLite
- Timeline widget + Correlation heatmap on dashboard
- CommandK search palette wiring

## Personas
- Macro trader, geopolitical analyst, commodities PM, intel researcher

## Notes
- No auth, no paid APIs, all data is illustrative mock

## Phase 2A — SHIPPED (Feb 2026)
- **News Feed page** (/news): full page with free-text search, impact filter (all/high/medium/low), region filter dropdown, filtered list with thumbnails/badges/timestamps/commodity chips
- **Countries drill-down** (/countries): interactive Leaflet map with clickable markers (gold ring on selected), searchable country list, side detail panel showing Political/Economic/Overall risk bars (animated), recent events, affected commodities chips. Close button clears selection.
- **Predictions page** (/predictions): 6 prediction cards, each with animated ProbabilityGauge (bullish/bearish semicircle with rotating needle), signal badge (strong_buy/buy/neutral/sell/strong_sell), forecast Recharts line chart, historical correlations vs DXY/10Y/VIX with center-anchored bars
- **Settings page** (/settings): watchlist toggles for 6 commodities, risk threshold slider (0-100), default region select. Persisted to SQLite via GET/PUT /api/settings. Verified roundtrip: PUT → reload → values restored.
- **New backend endpoints**: GET /api/settings, PUT /api/settings, GET /api/countries/{code} (404 for unknown)
- Testing: iteration_3.json — 100% backend, 100% frontend

## Phase 2B — Remaining
- Commodities detail page (/commodities/[id]) — multi-timeframe technicals + exposure heatmap
- Dashboard: Timeline widget + Correlation heatmap
- ⌘K global search palette wiring
