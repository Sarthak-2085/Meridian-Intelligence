"use client";
import type { CountryRisk } from "@/lib/api";
import { motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

function RiskBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#EF4444" : value >= 40 ? "#F59E0B" : "#10B981";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
          {label}
        </span>
        <span className="font-serif text-2xl" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
    </div>
  );
}

export function CountryDetail({
  country,
  onClose,
}: {
  country: CountryRisk;
  onClose: () => void;
}) {
  return (
    <motion.aside
      key={country.code}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="glass rounded-2xl p-6"
      data-testid={`country-detail-${country.code}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">
            Country · {country.code}
          </div>
          <h2 className="font-serif text-3xl mt-1 tracking-tight">
            {country.name}
          </h2>
        </div>
        <button
          data-testid="close-country-detail"
          onClick={onClose}
          className="h-8 w-8 rounded-md border border-white/[0.08] hover:bg-white/[0.05] flex items-center justify-center transition"
        >
          <X className="h-4 w-4 text-white/60" />
        </button>
      </div>

      <div className="hair-divider my-5" />

      <div className="grid grid-cols-1 gap-5">
        <RiskBar label="Political Risk" value={country.political_risk} />
        <RiskBar label="Economic Risk" value={country.economic_risk} />
        <RiskBar label="Overall Risk" value={country.overall_risk} />
      </div>

      <div className="hair-divider my-5" />

      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">
        Recent Events
      </div>
      <ul className="space-y-2.5" data-testid="country-events">
        {country.recent_events.map((e, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[13px] text-white/85"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-editorial-gold shrink-0 mt-0.5" />
            <span>{e}</span>
          </li>
        ))}
      </ul>

      <div className="hair-divider my-5" />

      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">
        Affected Commodities
      </div>
      <div className="flex flex-wrap gap-2" data-testid="country-commodities">
        {country.affected_commodities.map((c) => (
          <span
            key={c}
            className="text-xs font-mono uppercase text-editorial-gold/90 border border-editorial-gold/30 rounded-md px-2 py-1 bg-editorial-gold/5"
          >
            {c}
          </span>
        ))}
      </div>
    </motion.aside>
  );
}
