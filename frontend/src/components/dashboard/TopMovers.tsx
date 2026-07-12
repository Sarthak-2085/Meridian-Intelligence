"use client";
import { motion } from "framer-motion";
import { fmtPct } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

type Mover = {
  symbol: string;
  name: string;
  change: number;
  direction: "up" | "down";
};

export function TopMovers({ movers }: { movers: Mover[] }) {
  return (
    <div className="glass rounded-2xl p-6" data-testid="top-movers">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">
            Markets
          </div>
          <h3 className="font-serif text-xl mt-0.5">Top Movers</h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          24H
        </span>
      </div>
      <div className="hair-divider my-4" />
      <ul className="space-y-2">
        {movers.map((m, i) => {
          const up = m.direction === "up";
          return (
            <motion.li
              key={m.symbol}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.03] transition"
              data-testid={`mover-${m.symbol.toLowerCase()}`}
            >
              <div
                className={`h-7 w-7 rounded-md flex items-center justify-center ${up ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"}`}
              >
                {up ? (
                  <ArrowUp className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDown className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {m.symbol}
                </div>
                <div className="text-sm text-white/90 truncate">{m.name}</div>
              </div>
              <div
                className={`font-mono text-sm ${up ? "text-bull" : "text-bear"}`}
              >
                {fmtPct(m.change)}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
