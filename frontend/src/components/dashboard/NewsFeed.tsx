'use client';
import { motion } from 'framer-motion';
import type { NewsItem } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

const impactStyles: Record<string, string> = {
  high: 'text-bear border-bear/40 bg-bear/5',
  medium: 'text-warn border-warn/40 bg-warn/5',
  low: 'text-bull border-bull/40 bg-bull/5',
};

export function NewsFeed({ news }: { news: NewsItem[] }) {
  return (
    <div className="glass rounded-2xl h-full flex flex-col" data-testid="news-feed-panel">
      <div className="px-6 pt-6 pb-4 flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">Live Wire</div>
          <h3 className="font-serif text-2xl mt-1">Geopolitical Feed</h3>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-bull animate-pulse" /> Streaming
        </span>
      </div>
      <div className="hair-divider mx-6" />
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {news.map((n, i) => (
          <motion.a
            key={n.id}
            href={n.url || '#'}
            target={n.url ? '_blank' : undefined}
            rel={n.url ? 'noopener noreferrer' : undefined}
            data-testid={`news-item-${n.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="group flex gap-3 px-4 py-3.5 rounded-lg hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5"
          >
            <div
              className="h-14 w-14 shrink-0 rounded-lg bg-cover bg-center border border-white/5"
              style={{ backgroundImage: `url(${n.thumbnail})` }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${impactStyles[n.impact]}`}>
                  {n.impact}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 truncate">
                  {n.source} · {n.region}
                </span>
              </div>
              <div className="font-serif text-[15px] leading-snug text-white/95 group-hover:text-white line-clamp-2">
                {n.headline}
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {timeAgo(n.timestamp)}
                </span>
                <div className="flex gap-1">
                  {n.affected_commodities.slice(0, 3).map((c) => (
                    <span key={c} className="text-[10px] font-mono uppercase text-editorial-gold/70 border border-editorial-gold/20 rounded px-1.5">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-editorial-gold shrink-0 mt-1 transition" />
          </motion.a>
        ))}
      </div>
    </div>
  );
}