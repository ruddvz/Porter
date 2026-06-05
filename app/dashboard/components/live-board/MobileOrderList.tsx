"use client";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatCurrencyInr,
  itemSummaryLine,
  orderStatusBadge,
  paymentBadge,
  pendingTimeUrgency,
  timeAgoLabel,
  type OrderWithItems,
} from "@/lib/orders-ui";
import type { Order } from "@/types";
import { cn } from "@/lib/cn";
import OrderRowQuickActions from "./OrderRowQuickActions";
import { listAccentClass, listStageLabel } from "./types";

export default function MobileOrderList({
  orders,
  nowMs,
  newIds,
  onOpen,
  onPatch,
}: {
  orders: OrderWithItems[];
  nowMs: number;
  newIds: Set<string>;
  onOpen: (o: OrderWithItems) => void;
  onPatch: (order: OrderWithItems, u: Partial<Order>) => void;
}) {
  if (orders.length === 0) {
    return <EmptyState title="No orders in range" description="Adjust the date range or clear search." />;
  }

  return (
    <>
      {orders.map((o) => {
        const pay = paymentBadge(o);
        const st = orderStatusBadge(o.status);
        const urgency = pendingTimeUrgency(o.status, o.created_at, nowMs);
        const showActions = o.status !== "delivered" && o.status !== "cancelled";
        return (
          <article
            key={o.id}
            className={cn(
              "overflow-hidden rounded-xl border border-porter-bg-border bg-porter-bg-surface shadow-card transition-[box-shadow,transform] hover:border-porter-green-500/25 hover:shadow-raised",
              "border-l-4",
              listAccentClass(o),
              newIds.has(o.id) && "animate-porter-slide-in-right shadow-glow ring-1 ring-porter-green-500/20",
            )}
          >
            <button
              type="button"
              onClick={() => onOpen(o)}
              className="w-full px-4 pb-2 pt-3 text-left transition-transform active:scale-[0.99]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-porter-text-primary">{o.customer_name || "Customer"}</p>
                  <p className="text-mono text-xs text-porter-text-muted">{o.customer_phone}</p>
                </div>
                <span className="shrink-0 text-lg font-bold tabular-nums text-porter-text-primary">
                  {formatCurrencyInr(o.total_amount)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge kind="status" variant={st.variant} label={listStageLabel(o)} size="sm" />
                <Badge kind="status" variant={pay.statusVariant} label={pay.label} size="sm" />
                <span
                  className={cn(
                    "text-mono text-xs tabular-nums",
                    urgency === "critical"
                      ? "text-porter-status-cancelled"
                      : urgency === "warn"
                        ? "text-porter-orange-500"
                        : "text-porter-text-muted",
                  )}
                >
                  {timeAgoLabel(o.created_at, nowMs)}
                </span>
              </div>
              <p className="mt-2 truncate text-sm text-porter-text-secondary">{itemSummaryLine(o.order_items)}</p>
            </button>
            {showActions ? (
              <div
                className="flex flex-wrap gap-1 border-t border-porter-bg-border bg-porter-bg-base/40 px-2 py-2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <OrderRowQuickActions order={o} onPatch={(u) => onPatch(o, u)} />
              </div>
            ) : null}
          </article>
        );
      })}
    </>
  );
}
