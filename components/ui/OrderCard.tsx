import { cn } from "@/lib/cn";
import type { BadgeStatusVariant } from "./Badge";
import { Badge } from "./Badge";
import type { KeyboardEvent, ReactNode } from "react";

export type OrderCardPayment = {
  label: string;
  statusVariant: BadgeStatusVariant;
  methodLabel: string;
};

export type OrderCardProps = {
  customerName: string;
  phone?: string;
  itemsSummary: string;
  totalFormatted: string;
  statusLabel: string;
  statusVariant: BadgeStatusVariant;
  payment: OrderCardPayment;
  timeLabel: string;
  timeUrgency?: "normal" | "warn" | "critical";
  actions?: ReactNode;
  dimmed?: boolean;
  isNew?: boolean;
  className?: string;
  onCardClick?: () => void;
};

export function OrderCard({
  customerName,
  phone,
  itemsSummary,
  totalFormatted,
  statusLabel,
  statusVariant,
  payment,
  timeLabel,
  timeUrgency = "normal",
  actions,
  dimmed,
  isNew,
  className,
  onCardClick,
}: OrderCardProps) {
  const timeCls =
    timeUrgency === "critical"
      ? "text-porter-status-cancelled"
      : timeUrgency === "warn"
        ? "text-porter-orange-500"
        : "text-porter-text-muted";

  function onKeyDown(e: KeyboardEvent) {
    if (!onCardClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onCardClick();
    }
  }

  return (
    <article
      className={cn(
        "rounded-xl border border-porter-bg-border bg-porter-bg-surface p-4 shadow-card transition-[box-shadow,transform,border-color] duration-base",
        "hover:shadow-raised hover:border-porter-green-500/25",
        dimmed && "opacity-60 hover:opacity-80",
        isNew && "animate-porter-slide-in-right shadow-glow ring-1 ring-porter-green-500/20",
        className,
      )}
    >
      <div
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onClick={onCardClick}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full text-left outline-none",
          onCardClick && "cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-porter-green-500/40",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-title text-porter-text-primary">{customerName}</p>
            {phone && <p className="text-mono text-porter-text-muted">{phone}</p>}
          </div>
          <Badge kind="status" variant={statusVariant} label={statusLabel} size="sm" />
        </div>
        <p className="mt-2 line-clamp-2 text-body text-porter-text-secondary">{itemsSummary}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-label text-porter-text-muted">Total</p>
            <p className="font-display text-3xl tracking-wide text-porter-text-primary">{totalFormatted}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge kind="status" variant={payment.statusVariant} label={payment.label} size="sm" />
            <span className="rounded-md border border-porter-bg-border bg-porter-bg-raised px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-porter-text-secondary">
              {payment.methodLabel}
            </span>
          </div>
        </div>
        <p className={cn("mt-2 text-xs font-medium", timeCls)}>{timeLabel}</p>
      </div>
      {actions && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-porter-bg-border pt-4" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </article>
  );
}
