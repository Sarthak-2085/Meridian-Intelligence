'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { api, type Prediction } from '@/lib/api';
import { ProbabilityGauge } from '@/components/predictions/ProbabilityGauge';
import { Skeleton } from '@/components/ui/Skeleton';
import { fmt } from '@/lib/utils';

const TOOLTIP_STYLE = {
  background: 'rgba(24,25,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  fontSize: 11,
  fontFamily: 'JetBrains Mono',
  color: '#fff',
  backdropFilter: 'blur(20px)',
} as const;

function CorrelationRow({ label, value }: { label: string; value: number }) {
  const width = Math.abs(value) * 100;
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-white/50 w-10">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full relative overflow-hidden">
        <span className="absolute left-1/2 top-0 bottom-0 w-px bg-white/15" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width / 2}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            [positive ? 'left' : 'right']: '50%',
            background: positive ? '#10B981' : '#EF4444',
          }}
        />
      </div>
      <span className={`font-mono text-xs w-12 text-right ${positive ? 'text-bull' : 'text-bear'}`}>{value.toFixed(2)}</span>
    </div>
  );
}

function PredictionCard({ p, index }: { p: Prediction; index: number }) {
  const data = p.trend.map((v, i) => ({ i, v }));
  const first = p.trend[0];
  const last = p.trend[p.trend.length - 1];
  const isBull = last >= first;

  return (
    <motion.div
      data-testid={`prediction-card-${p.symbol.toLowerCase()}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">{p.symbol} · {p.horizon_days}D horizon</div>
          <h3 className="font-serif text-2xl mt-1">{p.name}</h3>
        </div>
        <ProbabilityGauge bullish={p.bullish_probability} bearish={p.bearish_probability} signal={p.signal} size={140} />
      </div>

      <div className="hair-divider my-5" />

      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-2">Forecast Trend</div>
      <div className="h-32 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
            <XAxis dataKey="i" hide />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${fmt(v)}`, '']} labelFormatter={() => ''} />
            <Line type="monotone" dataKey="v" stroke={isBull ? '#10B981' : '#EF4444'} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="hair-divider my-5" />

      <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-3">Historical Correlations</div>
      <div className="space-y-3" data-testid={`corr-${p.symbol.toLowerCase()}`}>
        {p.correlations.map((c) => (
          <CorrelationRow key={c.with} label={c.with} value={c.value} />
        ))}
      </div>
    </motion.div>
  );
}

export default function PredictionsPage() {
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await api.predictions();
        setPreds(p);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6" data-testid="predictions-page">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">Signal · 30D Horizon</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2 tracking-tight">
          Probability, <em className="text-editorial-gold not-italic">without the noise.</em>
        </h1>
        <p className="text-white/55 mt-3 max-w-2xl text-[15px]">Bullish/bearish odds, forecast trends, and cross-asset correlations for every tracked commodity.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
        {!loading && preds.map((p, i) => <PredictionCard key={p.symbol} p={p} index={i} />)}
      </div>
    </div>
  );
}
