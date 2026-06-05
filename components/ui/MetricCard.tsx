import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type MetricCardProps = {
  label: string;
  value: ReactNode;
  subtext?: string;
  icon?: LucideIcon;
  delta?: ReactNode;
  className?: string;
};

export function MetricCard({ label, value, subtext, icon: Icon, delta, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--po-radius-lg)] border border-porter-bg-border bg-porter-bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-porter-text-muted">{label}</p>
        {Icon ? (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--po-radius-sm)] bg-[var(--po-primary-soft)] text-porter-green-600">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-sans text-2xl font-bold tabular-nums tracking-tight text-porter-text-primary">{value}</p>
      {subtext ? <p className="mt-1 text-xs text-porter-text-muted">{subtext}</p> : null}
      {delta ? <div className="mt-2">{delta}</div> : null}
    </div>
  );
}
