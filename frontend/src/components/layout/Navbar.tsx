'use client';
import { Search, Bell, Command } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        d.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'UTC',
          hour12: false,
        }) + ' UTC'
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header
      data-testid="app-navbar"
      className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/75 backdrop-blur-2xl"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center gap-4">
        <div className="lg:hidden font-serif text-xl">Meridian</div>
        <div className="flex-1 max-w-xl relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            data-testid="global-search"
            placeholder="Search countries, commodities, events…"
            className="w-full h-10 pl-10 pr-16 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-editorial-gold/40 focus:bg-white/[0.05] transition"
          />
          <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-mono text-white/40">
            <Command className="h-3 w-3" /> K
          </kbd>
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-editorial-gold" />
          <span data-testid="live-clock">{now}</span>
        </div>
        <button
          data-testid="notifications-btn"
          className="relative h-10 w-10 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-center transition"
        >
          <Bell className="h-4 w-4 text-white/70" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-bear" />
        </button>
      </div>
    </header>
  );
}
