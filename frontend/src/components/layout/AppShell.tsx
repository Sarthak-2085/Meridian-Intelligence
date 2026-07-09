'use client';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-ink-950 text-white relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
        <footer className="px-6 lg:px-10 py-6 text-xs font-mono uppercase tracking-widest text-white/30 border-t border-white/5">
          <span className="text-editorial-gold/70">Meridian</span> · Geopolitical Intelligence · v0.1 · All data is illustrative
        </footer>
      </div>
    </div>
  );
}
