'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type DashboardPayload } from '@/lib/api';
import { CommodityCard } from '@/components/dashboard/CommodityCard';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { AIInsights } from '@/components/dashboard/AIInsights';
import { RiskMeter } from '@/components/dashboard/RiskMeter';
import { TopMovers } from '@/components/dashboard/TopMovers';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle, RefreshCcw } from 'lucide-react';

const WorldMap = dynamic(() => import('@/components/dashboard/WorldMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const HEADER_MOTION = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const MAP_MOTION    = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1,  duration: 0.5 } };
const NEWS_MOTION   = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15, duration: 0.5 } };

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const d = await api.dashboard();
      setData(d);
    } catch (e: any) {
      setErr(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (err) {
    return (
      <div className="glass rounded-2xl p-10 flex flex-col items-center text-center gap-4" data-testid="dashboard-error">
        <AlertCircle className="h-10 w-10 text-bear" />
        <div className="font-serif text-2xl">Signal lost.</div>
        <div className="text-white/60 text-sm max-w-md">
          We couldn&apos;t reach the intelligence feed. Please check your backend and try again.
        </div>
        <button
          onClick={load}
          className="mt-2 h-10 px-5 rounded-lg bg-editorial-gold/10 border border-editorial-gold/40 text-editorial-gold hover:bg-editorial-gold/20 transition flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
          data-testid="retry-btn"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[480px]" />
          <Skeleton className="lg:col-span-4 h-[480px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <motion.div
        {...HEADER_MOTION}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">
            Command Room · {new Date(data.updated_at).toUTCString().slice(17, 25)} UTC
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mt-2 tracking-tight">
            Global Intelligence, <em className="text-editorial-gold not-italic">read at a glance.</em>
          </h1>
          <p className="text-white/55 mt-3 max-w-2xl text-[15px] leading-relaxed">
            Meridian correlates geopolitics with commodity markets in real time. Every card here is an actionable signal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 rounded-lg glass hover:bg-white/[0.06] font-mono text-[11px] uppercase tracking-widest text-white/80" data-testid="filter-btn">
            All Regions
          </button>
          <button
            onClick={load}
            data-testid="refresh-btn"
            className="h-10 px-4 rounded-lg bg-editorial-gold text-ink-950 hover:bg-editorial-goldDim font-mono text-[11px] uppercase tracking-widest flex items-center gap-2 transition"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Row 1: map + news */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          {...MAP_MOTION}
          className="lg:col-span-8 glass rounded-2xl overflow-hidden relative"
          style={{ minHeight: 480 }}
          data-testid="world-map-widget"
        >
          <div className="absolute top-4 right-6 z-[400] text-right pointer-events-none">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">World</div>
            <h3 className="font-serif text-2xl mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Risk Atlas</h3>
          </div>
          <WorldMap countries={data.countries} />
        </motion.div>

        <motion.div
          {...NEWS_MOTION}
          className="lg:col-span-4"
          style={{ minHeight: 480 }}
        >
          <NewsFeed news={data.news} />
        </motion.div>
      </div>

      {/* Row 2: commodity cards */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">Commodities</div>
            <h2 className="font-serif text-2xl md:text-3xl mt-1">The Ledger</h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
            Updated {new Date(data.updated_at).toLocaleTimeString()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="commodity-grid">
          {data.commodities.map((c, i) => (
            <CommodityCard key={c.id} c={c} index={i} />
          ))}
        </div>
      </div>

      {/* Row 3: insights + risk + movers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AIInsights insights={data.insights} />
        </div>
        <div className="lg:col-span-3">
          <RiskMeter value={data.global_risk_index} />
        </div>
        <div className="lg:col-span-3">
          <TopMovers movers={data.top_movers} />
        </div>
      </div>
    </div>
  );
}
