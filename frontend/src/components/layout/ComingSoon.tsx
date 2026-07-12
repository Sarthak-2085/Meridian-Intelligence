import { Construction } from "lucide-react";

export function ComingSoon({
  title,
  kicker,
  description,
}: {
  title: string;
  kicker: string;
  description: string;
}) {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center"
      data-testid={`coming-soon-${kicker.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="glass rounded-2xl p-10 max-w-lg text-center">
        <div className="mx-auto h-12 w-12 rounded-md bg-editorial-gold/10 border border-editorial-gold/30 flex items-center justify-center shadow-gold-glow">
          <Construction className="h-5 w-5 text-editorial-gold" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-editorial-gold/80 mt-5">
          {kicker}
        </div>
        <h1 className="font-serif text-3xl md:text-4xl mt-2">{title}</h1>
        <p className="text-white/60 text-sm mt-4 leading-relaxed">
          {description}
        </p>
        <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-white/40">
          Phase 2 · In production
        </div>
      </div>
    </div>
  );
}
