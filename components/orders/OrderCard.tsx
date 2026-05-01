"use client";

import type { Order, OrderItem } from "@/types";
import { useSharedNow } from "@/lib/hooks/useSharedNow";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useMemo, useState } from "react";

export type OrderWithItems = Order & { order_items?: OrderItem[] };

function timeAgo(iso: string, nowMs: number) {
  const s = Math.floor((nowMs - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} mins ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function paymentBadge(order: Order) {
  if (order.payment_method === "cod") {
    const st = order.payment_status;
    if (st === "cod_collected") return { label: "COD ✓", className: "bg-emerald-500/20 text-emerald-300" };
    return { label: "COD", className: "bg-[#FF6B35]/25 text-[#FF6B35]" };
  }
  if (order.payment_status === "paid") return { label: "PAID", className: "bg-[#25D366]/20 text-[#25D366]" };
  return { label: "UNPAID", className: "bg-[#FF6B35]/25 text-[#FF6B35]" };
}

function itemSummary(items: OrderItem[] | undefined) {
  if (!items?.length) return "—";
  const first = items.slice(0, 2).map((i) => `${i.product_name} ${i.quantity}${i.unit}`);
  const more = items.length > 2 ? `, +${items.length - 2} more` : "";
  return first.join(", ") + more;
}

/** Compact order card for kanban columns with optimistic status actions. */
export function OrderCard({
  order,
  onUpdate,
  onOpen,
}: {
  order: OrderWithItems;
  onUpdate: (o: Order) => void;
  onOpen: (o: OrderWithItems) => void;
}) {
  const nowMs = useSharedNow();
  const supabase = createSupabaseBrowserClient();
  const [busy, setBusy] = useState(false);
  const badge = useMemo(() => paymentBadge(order), [order]);

  async function patchOrder(updates: Partial<Order>) {
    setBusy(true);
    const prev = { ...order };
    onUpdate({ ...order, ...updates });
    const { error } = await supabase.from("orders").update(updates).eq("id", order.id);
    setBusy(false);
    if (error) {
      onUpdate(prev);
      alert(error.message);
    }
  }

  const tel = `tel:${order.customer_phone}`;

  return (
    <div
      className="animate-slide-in cursor-pointer rounded-xl border border-white/10 bg-[#0A0F0D] p-3 shadow-lg transition hover:border-[#25D366]/40"
      onClick={() => onOpen(order)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-white">{order.customer_name || "Customer"}</p>
          <a href={tel} className="text-sm text-[#25D366] underline-offset-2 hover:underline" onClick={(e) => e.stopPropagation()}>
            {order.customer_phone}
          </a>
        </div>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-white/60">{itemSummary(order.order_items)}</p>
      <p className="mt-2 font-display text-2xl text-white">₹{order.total_amount ?? "—"}</p>
      <p className="mt-1 text-xs text-white/40">{timeAgo(order.created_at, nowMs)}</p>
      <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
        {order.status === "pending" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => patchOrder({ status: "confirmed" })}
              className="rounded-lg bg-[#25D366] px-2 py-1 text-xs font-semibold text-black"
            >
              Confirm
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => patchOrder({ status: "cancelled" })}
              className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white/80"
            >
              Cancel
            </button>
          </>
        )}
        {order.status === "confirmed" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patchOrder({ status: "preparing" })}
            className="rounded-lg bg-[#25D366] px-2 py-1 text-xs font-semibold text-black"
          >
            Preparing
          </button>
        )}
        {(order.status === "preparing" || order.status === "paid") && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patchOrder({ status: "out_for_delivery" })}
            className="rounded-lg bg-[#FF6B35] px-2 py-1 text-xs font-semibold text-black"
          >
            Out for delivery
          </button>
        )}
        {order.status === "out_for_delivery" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patchOrder({ status: "delivered", delivered_at: new Date().toISOString() })}
            className="rounded-lg bg-[#25D366] px-2 py-1 text-xs font-semibold text-black"
          >
            Delivered
          </button>
        )}
        {order.payment_method === "cod" && order.payment_status === "cod_pending" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patchOrder({ payment_status: "cod_collected" })}
            className="rounded-lg border border-[#FF6B35] px-2 py-1 text-xs font-semibold text-[#FF6B35]"
          >
            Mark cash collected
          </button>
        )}
      </div>
    </div>
  );
}
