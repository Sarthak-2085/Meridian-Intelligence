"use client";
import { motion } from "framer-motion";

export function ProbabilityGauge({
  bullish,
  bearish,
  signal,
  size = 160,
}: {
  bullish: number;
  bearish: number;
  signal: string;
  size?: number;
}) {
  const angle = -90 + (bullish / 100) * 180;
  const label = signal.replace("_", " ").toUpperCase();
  const bullColor = "#10B981";
  const bearColor = "#EF4444";
  const isBull = bullish >= 50;

  return (
    <div className="flex flex-col items-center" data-testid="probability-gauge">
      <svg viewBox="0 0 200 120" width={size} height={size * 0.7}>
        <defs>
          <linearGradient id="probArc" x1="0%" x2="100%">
            <stop offset="0%" stopColor={bearColor} />
            <stop offset="50%" stopColor="#71717A" />
            <stop offset="100%" stopColor={bullColor} />
          </linearGradient>
        </defs>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#probArc)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="35"
          initial={{ rotate: -90, transformOrigin: "100px 100px" }}
          animate={{ rotate: angle, transformOrigin: "100px 100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          stroke={isBull ? bullColor : bearColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="4" fill="#fff" />
      </svg>
      <div className="mt-1 text-center">
        <div
          className="font-serif text-3xl leading-none"
          style={{ color: isBull ? bullColor : bearColor }}
        >
          {bullish}%
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mt-1">
          Bullish · {bearish}% Bearish
        </div>
        <div
          className="font-mono text-[10px] uppercase tracking-[0.2em] mt-2 px-2 py-0.5 inline-block rounded border"
          style={{
            color: isBull ? bullColor : bearColor,
            borderColor: isBull
              ? "rgba(16,185,129,0.4)"
              : "rgba(239,68,68,0.4)",
            background: isBull
              ? "rgba(16,185,129,0.06)"
              : "rgba(239,68,68,0.06)",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
