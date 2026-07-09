'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type CountryRisk } from '@/lib/api';
import { CountryDetail } from '@/components/countries/CountryDetail';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search } from 'lucide-react';

const InteractiveMap = dynamic(() => import('@/components/countries/InteractiveMap'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function CountriesPage() {
  const [countries, setCountries] = useState<CountryRisk[]>([]);
  const [selected, setSelected] = useState<CountryRisk | null>(null);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cs = await api.countries();
        setCountries(cs);
        setSelected(cs[0] ?? null);
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return countries;
    const n = q.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(n) || c.code.toLowerCase().includes(n));
  }, [q, countries]);

  return (
    <div className="space-y-6" data-testid="countries-page">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">Atlas</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2 tracking-tight">
          Every country is a <em className="text-editorial-gold not-italic">signal</em>.
        </h1>
        <p className="text-white/55 mt-3 max-w-2xl text-[15px] leading-relaxed">
          Click a marker to open its political &amp; economic risk breakdown, recent events, and commodities exposed to it.
        </p>
      </motion.div>

      {err && (
        <div className="glass rounded-2xl p-6 text-bear text-sm" data-testid="countries-error">{err}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass rounded-2xl overflow-hidden relative" style={{ minHeight: 560 }} data-testid="countries-map">
          {loading ? <Skeleton className="h-full w-full" /> : (
            <InteractiveMap countries={countries} selectedCode={selected?.code ?? null} onSelect={setSelected} />
          )}
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              data-testid="country-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search countries…"
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-white/30 focus:outline-none focus:border-editorial-gold/40 focus:bg-white/[0.05] transition"
            />
          </div>
          <div className="glass rounded-2xl p-2 max-h-64 overflow-y-auto" data-testid="country-list">
            {filtered.map((c) => (
              <button
                key={c.code}
                data-testid={`country-item-${c.code}`}
                onClick={() => setSelected(c)}
                className={`w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                  selected?.code === c.code ? 'bg-editorial-gold/10 border border-editorial-gold/30' : 'border border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/40 w-8">{c.code}</span>
                <span className="text-sm text-white/90 flex-1 truncate">{c.name}</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: c.overall_risk >= 70 ? '#EF4444' : c.overall_risk >= 40 ? '#F59E0B' : '#10B981' }}
                >
                  {c.overall_risk}
                </span>
              </button>
            ))}
            {filtered.length === 0 && <div className="text-center text-white/40 text-sm py-6">No matches</div>}
          </div>
          {selected && <CountryDetail country={selected} onClose={() => setSelected(null)} />}
        </div>
      </div>
    </div>
  );
}
