"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { api, type CommodityDetail } from "@/lib/api";
import { fmt, fmtPct, timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  AlertCircle,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  MapPin,
} from "lucide-react";

const TIMEFRAMES = [
  { key: "history_1d", label: "1D" },
  { key: "history_7d", label: "7D" },
  { key: "history_30d", label: "30D" },
  { key: "history_1y", label: "1Y" },
] as const;

export default function CommodityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = String(params.symbol);

  const [data, setData] = useState<CommodityDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] =
    useState<(typeof TIMEFRAMES)[number]["key"]>("history_30d");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setData(await api.commodityDetail(symbol));
      } catch (e: any) {
        setErr(e?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [symbol]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="glass rounded-2xl p-10 flex flex-col items-center text-center gap-4">
        <AlertCircle className="h-10 w-10 text-bear" />
        <div className="font-serif text-2xl">Couldn&apos;t load {symbol}.</div>
        <button
          onClick={() => router.push("/commodities")}
          className="mt-2 h-10 px-5 rounded-lg bg-editorial-gold/10 border border-editorial-gold/40 text-editorial-gold hover:bg-editorial-gold/20 transition flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Commodities
        </button>
      </div>
    );
  }

  const up = data.change_24h >= 0;
  const stroke = up ? "#10B981" : "#EF4444";
  const chartData = data[timeframe].map((v, i) => ({ i, v }));

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/commodities")}
        className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition font-mono text-xs uppercase tracking-widest"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Commodities
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{data.icon}</span>
              <h1 className="font-serif text-3xl">{data.name}</h1>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1.5">
              {data.symbol} · {data.unit}
            </div>
          </div>
          <div
            className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${
              up
                ? "text-bull border-bull/40 bg-bull/5"
                : "text-bear border-bear/40 bg-bear/5"
            }`}
          >
            {up ? "Bullish" : "Bearish"}
          </div>
        </div>

        <div className="mt-5 flex items-baseline gap-3">
          <div className="font-serif text-4xl md:text-5xl tracking-tight">
            ${fmt(data.price)}
          </div>
          <div
            className={`flex items-center gap-1 text-base font-medium ${up ? "text-bull" : "text-bear"}`}
          >
            {up ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {fmtPct(data.change_24h)} (24h)
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border transition ${
                timeframe === tf.key
                  ? "text-editorial-gold border-editorial-gold/40 bg-editorial-gold/10"
                  : "text-white/40 border-white/[0.08] hover:text-white/70"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="h-56 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
                contentStyle={{
                  background: "rgba(24,25,30,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                  color: "#fff",
                }}
                formatter={(v: any) => [`$${fmt(v)}`, ""]}
                labelFormatter={() => ""}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke={stroke}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-editorial-gold" />
            <h3 className="font-serif text-xl">Geopolitical Exposure</h3>
          </div>
          {data.exposed_countries.length === 0 ? (
            <p className="text-white/40 text-sm">
              No significant country-level exposure detected right now.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.exposed_countries.map((name) => (
                <span
                  key={name}
                  className="font-mono text-xs px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/70"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-serif text-xl mb-4">Related News</h3>
          {data.related_news.length === 0 ? (
            <p className="text-white/40 text-sm">
              No related headlines right now.
            </p>
          ) : (
            <div className="space-y-3">
              {data.related_news.map((n) => (
                <div
                  key={n.id}
                  className="pb-3 border-b border-white/[0.06] last:border-0 last:pb-0"
                >
                  <div className="text-sm text-white/85 leading-snug">
                    {n.headline}
                  </div>
                  <div className="font-mono text-[10px] text-white/40 mt-1">
                    {n.source} · {timeAgo(n.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
