"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { api, type Commodity } from "@/lib/api";
import { CommodityCard } from "@/components/dashboard/CommodityCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function CommoditiesPage() {
  const [data, setData] = useState<Commodity[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      setData(await api.commodities());
    } catch (e: any) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (err) {
    return (
      <div
        className="glass rounded-2xl p-10 flex flex-col items-center text-center gap-4"
        data-testid="commodities-error"
      >
        <AlertCircle className="h-10 w-10 text-bear" />
        <div className="font-serif text-2xl">Signal lost.</div>
        <div className="text-white/60 text-sm max-w-md">
          We couldn&apos;t reach the intelligence feed. Please check your
          backend and try again.
        </div>
        <button
          onClick={load}
          className="mt-2 h-10 px-5 rounded-lg bg-editorial-gold/10 border border-editorial-gold/40 text-editorial-gold hover:bg-editorial-gold/20 transition flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">
          Markets
        </div>
        <h1 className="font-serif text-3xl mt-1">Commodities</h1>
        <p className="text-white/50 text-sm mt-1">
          Live prices, sentiment, and AI impact scoring across all tracked
          assets.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.map((c, i) => (
            <Link
              key={c.id}
              href={`/commodities/${c.symbol}`}
              className="block"
            >
              <CommodityCard c={c} index={i} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
