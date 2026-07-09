'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, type SettingsPayload } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Check, Save } from 'lucide-react';

const ALL_COMMODITIES = [
  { code: 'XAU', name: 'Gold' },
  { code: 'XAG', name: 'Silver' },
  { code: 'WTI', name: 'Crude Oil' },
  { code: 'NG', name: 'Natural Gas' },
  { code: 'ZW', name: 'Wheat' },
  { code: 'ZC', name: 'Corn' },
];

const REGIONS = ['All', 'MENA', 'Europe', 'Asia', 'North America', 'Africa', 'Middle East', 'Eastern EU', 'South Asia'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.settings();
        setSettings(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleWatch = (code: string) => {
    if (!settings) return;
    const has = settings.watchlist.includes(code);
    setSettings({ ...settings, watchlist: has ? settings.watchlist.filter((x) => x !== code) : [...settings.watchlist, code] });
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const s = await api.saveSettings(settings);
      setSettings(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-56" /><Skeleton className="h-40" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl" data-testid="settings-page">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80">Preferences</div>
        <h1 className="font-serif text-4xl md:text-5xl mt-2 tracking-tight">Tune your <em className="text-editorial-gold not-italic">intelligence stack.</em></h1>
        <p className="text-white/55 mt-3 max-w-2xl text-[15px]">Choose what to watch, when to be alerted, and where to focus. Saved to your workstation.</p>
      </motion.div>

      {/* Watchlist */}
      <div className="glass rounded-2xl p-6" data-testid="settings-watchlist">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Watchlist</div>
        <h3 className="font-serif text-xl">Commodities to track</h3>
        <div className="hair-divider my-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_COMMODITIES.map((c) => {
            const active = settings.watchlist.includes(c.code);
            return (
              <button
                key={c.code}
                data-testid={`watch-${c.code}`}
                onClick={() => toggleWatch(c.code)}
                className={`text-left rounded-lg px-4 py-3 border transition ${
                  active ? 'bg-editorial-gold/10 border-editorial-gold/40' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-4 w-4 rounded flex items-center justify-center border ${active ? 'bg-editorial-gold border-editorial-gold' : 'border-white/25'}`}>
                    {active && <Check className="h-2.5 w-2.5 text-ink-950" />}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">{c.code}</span>
                </div>
                <div className="font-serif text-lg mt-1">{c.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk threshold */}
      <div className="glass rounded-2xl p-6" data-testid="settings-threshold">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">Alerts</div>
        <h3 className="font-serif text-xl">Risk threshold</h3>
        <div className="hair-divider my-4" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-white/60">Notify me when overall country risk exceeds</span>
          <span className="font-serif text-3xl text-editorial-gold" data-testid="threshold-value">{settings.risk_threshold}</span>
        </div>
        <input
          data-testid="threshold-slider"
          type="range"
          min={0}
          max={100}
          value={settings.risk_threshold}
          onChange={(e) => setSettings({ ...settings, risk_threshold: Number(e.target.value) })}
          className="w-full mt-4 accent-editorial-gold"
        />
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/40 mt-1">
          <span>Calm · 0</span>
          <span>Elevated · 50</span>
          <span>Critical · 100</span>
        </div>
      </div>

      {/* Default region */}
      <div className="glass rounded-2xl p-6" data-testid="settings-region">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">View</div>
        <h3 className="font-serif text-xl">Default region focus</h3>
        <div className="hair-divider my-4" />
        <select
          data-testid="region-select"
          value={settings.default_region}
          onChange={(e) => setSettings({ ...settings, default_region: e.target.value })}
          className="w-full h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white/90 focus:outline-none focus:border-editorial-gold/40"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r} className="bg-ink-900">{r}</option>
          ))}
        </select>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          data-testid="save-settings"
          className="h-11 px-6 rounded-lg bg-editorial-gold text-ink-950 hover:bg-editorial-goldDim disabled:opacity-50 font-mono text-[11px] uppercase tracking-widest flex items-center gap-2 transition"
        >
          {saving ? <span className="animate-pulse">Saving…</span> : (<><Save className="h-3.5 w-3.5" /> Save preferences</>)}
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-sm text-bull"
            data-testid="saved-indicator"
          >
            <Check className="h-3.5 w-3.5" /> Saved
          </motion.span>
        )}
        {settings.updated_at && (
          <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-white/40">
            Last saved · {new Date(settings.updated_at).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
