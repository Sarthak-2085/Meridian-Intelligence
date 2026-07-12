"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  LineChart,
  Globe2,
  Sparkles,
  Settings,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    testid: "nav-dashboard",
  },
  { href: "/news", label: "News Feed", icon: Newspaper, testid: "nav-news" },
  {
    href: "/commodities",
    label: "Commodities",
    icon: LineChart,
    testid: "nav-commodities",
  },
  {
    href: "/countries",
    label: "Countries",
    icon: Globe2,
    testid: "nav-countries",
  },
  {
    href: "/predictions",
    label: "Predictions",
    icon: Sparkles,
    testid: "nav-predictions",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    testid: "nav-settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      data-testid="app-sidebar"
      className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-white/5 bg-ink-950/70 backdrop-blur-2xl z-30"
    >
      <div className="px-6 pt-8 pb-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-editorial-gold/10 border border-editorial-gold/30 flex items-center justify-center shadow-gold-glow">
          <Compass className="h-4 w-4 text-editorial-gold" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-serif text-2xl tracking-tight">Meridian</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">
            Intelligence
          </span>
        </div>
      </div>
      <div className="hair-divider mx-6" />
      <nav className="flex-1 px-3 py-6 space-y-0.5">
        {NAV.map((n) => {
          const active = pathname === n.href;
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              data-testid={n.testid}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-white/[0.04] text-white border border-editorial-gold/20 shadow-inner-hair"
                  : "text-white/55 hover:text-white hover:bg-white/[0.03] border border-transparent",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active
                    ? "text-editorial-gold"
                    : "text-white/40 group-hover:text-white/70",
                )}
              />
              <span className="font-medium">{n.label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-editorial-gold" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mx-4 mb-6 p-4 rounded-xl glass">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">
          System
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-bull animate-pulse" />
          <span className="text-xs text-white/70">All feeds nominal</span>
        </div>
        <div className="mt-3 text-[11px] text-white/40">
          Mock data · No paid APIs
        </div>
      </div>
    </aside>
  );
}
