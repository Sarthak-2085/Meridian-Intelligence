"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api, type NewsItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search, ArrowUpRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

const IMPACTS: Array<"all" | "high" | "medium" | "low"> = [
  "all",
  "high",
  "medium",
  "low",
];
const impactStyles: Record<string, string> = {
  high: "text-bear border-bear/40 bg-bear/5",
  medium: "text-warn border-warn/40 bg-warn/5",
  low: "text-bull border-bull/40 bg-bull/5",
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [impact, setImpact] = useState<"all" | "high" | "medium" | "low">(
    "all",
  );
  const [region, setRegion] = useState<string>("All");

  useEffect(() => {
    (async () => {
      try {
        const n = await api.news();
        setNews(n);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const regions = useMemo(
    () => ["All", ...Array.from(new Set(news.map((n) => n.region)))],
    [news],
  );

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return news.filter((n) => {
      if (impact !== "all" && n.impact !== impact) return false;
      if (region !== "All" && n.region !== region) return false;
      if (
        needle &&
        !(
          n.headline.toLowerCase().includes(needle) ||
          n.source.toLowerCase().includes(needle)
        )
      )
        return false;
      return true;
    });
  }, [news, q, impact, region]);

  return (
    <div className="space-y-6" data-testid="news-page">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">
          Live Wire
        </div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2 tracking-tight">
          Every headline,{" "}
          <em className="text-editorial-gold not-italic">contextualised.</em>
        </h1>
        <p className="text-white/55 mt-3 max-w-2xl text-[15px]">
          Filter by impact, region, and free-text search.
        </p>
      </motion.div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            data-testid="news-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search headlines, sources…"
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-white/30 focus:outline-none focus:border-editorial-gold/40"
          />
        </div>
        <div className="flex gap-1.5" data-testid="impact-filter">
          {IMPACTS.map((i) => (
            <button
              key={i}
              data-testid={`impact-${i}`}
              onClick={() => setImpact(i)}
              className={`h-10 px-3 rounded-lg font-mono text-[10px] uppercase tracking-widest transition border ${
                impact === i
                  ? "bg-editorial-gold text-ink-950 border-editorial-gold"
                  : "text-white/60 border-white/[0.08] hover:bg-white/[0.05]"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <select
          data-testid="region-filter"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="h-10 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white/80 focus:outline-none focus:border-editorial-gold/40"
        >
          {regions.map((r) => (
            <option key={r} value={r} className="bg-ink-900">
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div
        className="glass rounded-2xl divide-y divide-white/[0.05]"
        data-testid="news-list"
      >
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 m-3" />
          ))}
        {!loading && filtered.length === 0 && (
          <div className="p-10 text-center text-white/50 text-sm">
            No headlines match those filters.
          </div>
        )}
        {!loading &&
          filtered.map((n, i) => (
            <motion.a
              key={n.id}
              data-testid={`news-row-${n.id}`}
              href="#"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
              className="group flex gap-4 p-5 hover:bg-white/[0.03] transition"
            >
              <div
                className="h-20 w-28 shrink-0 rounded-lg bg-cover bg-center border border-white/5"
                style={{ backgroundImage: `url(${n.thumbnail})` }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${impactStyles[n.impact]}`}
                  >
                    {n.impact}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {n.source} · {n.region} · {n.category}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/30 ml-auto">
                    {timeAgo(n.timestamp)}
                  </span>
                </div>
                <div className="font-serif text-lg leading-snug text-white/95 group-hover:text-white">
                  {n.headline}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {n.affected_commodities.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-mono uppercase text-editorial-gold/80 border border-editorial-gold/20 rounded px-1.5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/20 group-hover:text-editorial-gold shrink-0 mt-2 transition" />
            </motion.a>
          ))}
      </div>
    </div>
  );
}
