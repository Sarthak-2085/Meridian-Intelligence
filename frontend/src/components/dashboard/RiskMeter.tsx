"use client";
import { motion } from "framer-motion";

export function RiskMeter({ value }: { value: number }) {
  // arc from -120deg to 120deg (240deg total)
  const angle = -120 + (value / 100) * 240;
  const level = value >= 70 ? "Elevated" : value >= 40 ? "Moderate" : "Stable";
  const levelColor =
    value >= 70 ? "#EF4444" : value >= 40 ? "#F59E0B" : "#10B981";

  return (
    <div className="glass rounded-2xl p-6" data-testid="risk-meter">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">
            Global
          </div>
          <h3 className="font-serif text-xl mt-0.5">Risk Meter</h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          Live
        </span>
      </div>
      <div className="hair-divider my-5" />
      <div className="relative h-40 flex items-end justify-center">
        <svg viewBox="0 0 200 130" className="w-full h-full">
          <defs>
            <linearGradient id="riskArc" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 20 110 A 80 80 0 0 1 180 110"
            fill="none"
            stroke="url(#riskArc)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 251.3} 251.3`}
          />
        </svg>
        <motion.div
          initial={{ rotate: -120 }}
          animate={{ rotate: angle }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute left-1/2 bottom-[18px] w-[2px] h-16 origin-bottom -translate-x-1/2"
          style={{
            background: levelColor,
            boxShadow: `0 0 10px ${levelColor}`,
          }}
        />
        <div className="absolute left-1/2 bottom-[10px] -translate-x-1/2 h-3 w-3 rounded-full bg-white/80" />
      </div>
      <div className="text-center -mt-2">
        <div className="font-serif text-4xl" data-testid="risk-value">
          {value}
        </div>
        <div
          className="font-mono text-[10px] uppercase tracking-widest mt-1"
          style={{ color: levelColor }}
        >
          {level}
        </div>
      </div>
    </div>
  );
}
