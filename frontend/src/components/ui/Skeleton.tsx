export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/[0.03] rounded-lg ${className}`}
    >
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
          backgroundSize: "500px 100%",
        }}
      />
    </div>
  );
}
