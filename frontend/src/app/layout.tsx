import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Meridian — Geopolitical Market Intelligence",
  description: "AI-powered geopolitical market intelligence dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="fixed inset-0 pointer-events-none bg-grain opacity-40 mix-blend-overlay" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
