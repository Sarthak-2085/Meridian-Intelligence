"use client";
import { motion } from "framer-motion";
import type { Insight } from "@/lib/api";
import { Sparkles } from "lucide-react";

export function AIInsights({ insights }: { insights: Insight[] }) {
  return (
    <div className="glass rounded-2xl p-6" data-testid="ai-insights-panel">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-editorial-gold/10 border border-editorial-gold/30 flex items-center justify-center shadow-gold-glow">
          <Sparkles className="h-4 w-4 text-editorial-gold" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">
            Signal
          </div>
          <h3 className="font-serif text-xl leading-none mt-0.5">
            AI Insights
          </h3>
        </div>
      </div>
      <div className="hair-divider my-5" />
      <div className="space-y-4">
        {insights.map((i, idx) => (
          <motion.div
            key={i.id}
            data-testid={`insight-${i.id}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-editorial-gold/30 text-editorial-gold/90 bg-editorial-gold/5">
                {i.tag}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="h-1 w-10 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-editorial-gold"
                    style={{ width: `${i.confidence}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-white/60">
                  {i.confidence}%
                </span>
              </div>
            </div>
            <div className="font-serif text-[17px] leading-snug text-white/95">
              {i.title}
            </div>
            <p className="text-[13px] text-white/60 mt-1 leading-relaxed">
              {i.detail}
            </p>
            {idx < insights.length - 1 && <div className="hair-divider mt-4" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
