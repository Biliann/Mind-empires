import type { ReactNode } from "react";

export function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`smooth-card rounded-lg border border-black/10 bg-white/92 p-4 shadow-insetGlow backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ember">
      {children}
    </p>
  );
}

export function Stat({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-black/10 bg-ink p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-mist">{label}</p>
      <p className="mt-1 text-lg font-semibold text-bone">{value}</p>
    </div>
  );
}
