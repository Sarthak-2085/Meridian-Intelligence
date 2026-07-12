"use client";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import type { Commodity } from "@/lib/api";
import { fmt, fmtPct } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

const HOVER = { y: -3 };
const Y_DOMAIN: [string, string] = ["dataMin", "dataMax"];
const CURSOR = { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 };
const TOOLTIP_STYLE = {
  background: "rgba(24,25,30,0.9)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  fontSize: 11,
  fontFamily: "JetBrains Mono",
  color: "#fff",
  backdropFilter: "blur(20px)",
} as const;

export function CommodityCard({
  c,
  index = 0,
}: {
  c: Commodity;
  index?: number;
}) {
  const up = c.change_24h >= 0;
  const stroke = up ? "#10B981" : "#EF4444";
  const data = c.sparkline.map((v, i) => ({ i, v }));

  return (
    <motion.div
      data-testid={`commodity-card-${c.symbol.toLowerCase()}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: "easeOut" }}
      whileHover={HOVER}
      className="glass glass-hover rounded-2xl p-5 transition-all duration-300 group relative overflow-hidden"
    >
      <div
        className="absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-[0.06] group-hover:opacity-[0.12] transition"
        style={{
          background: `radial-gradient(circle, ${stroke}, transparent 70%)`,
        }}
      />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{c.icon}</span>
            <span className="font-serif text-xl leading-none">{c.name}</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1.5">
            {c.symbol} · {c.unit}
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

      <div className="mt-4 flex items-baseline gap-3">
        <div
          className="font-serif text-3xl md:text-4xl tracking-tight"
          data-testid={`commodity-price-${c.symbol.toLowerCase()}`}
        >
          ${fmt(c.price)}
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${up ? "text-bull" : "text-bear"}`}
        >
          {up ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {fmtPct(c.change_24h)}
        </div>
      </div>

      <div className="h-14 -mx-1 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis hide domain={Y_DOMAIN} />
            <Tooltip
              cursor={CURSOR}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v: any) => [`$${fmt(v)}`, ""]}
              labelFormatter={() => ""}
            />
            <Line
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={1.75}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">
            7d Trend
          </div>
          <div
            className={`text-sm font-medium ${c.change_7d >= 0 ? "text-bull" : "text-bear"}`}
          >
            {fmtPct(c.change_7d)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">
            AI Impact
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1 w-16 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${c.ai_impact_score}%`,
                  background:
                    c.ai_impact_score >= 70
                      ? "#D4AF37"
                      : c.ai_impact_score >= 40
                        ? "#F59E0B"
                        : "#3B82F6",
                }}
              />
            </div>
            <span className="font-mono text-xs text-white/80">
              {c.ai_impact_score}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
