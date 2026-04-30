"use client";

import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderCard as UiOrderCard } from "@/components/ui/OrderCard";
import { StatCard } from "@/components/ui/StatCard";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { useSharedNow } from "@/lib/hooks/useSharedNow";
import type { OrderWithItems } from "@/lib/orders-ui";
import {
  formatCurrencyInr,
  itemSummaryLine,
  orderStatusBadge,
  paymentBadge,
  pendingTimeUrgency,
  timeAgoLabel,
} from "@/lib/orders-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Order, Seller } from "@/types";
import { Bike, Check, Package, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Live kanban board with realtime order updates and today stats. */
export default function LiveOrdersBoard({
  seller,
  initialOrders,
}: {
  seller: Seller;
  initialOrders: OrderWithItems[];
}) {
  const { push: toast } = useToast();
  const nowMs = useSharedNow();
  const supabase = createSupabaseBrowserClient();
  const { orders, setOrders } = useRealtimeOrders(seller.id, initialOrders as Order[]);
  const typed = orders as OrderWithItems[];
  const [panel, setPanel] = useState<OrderWithItems | null>(null);
  const seenIds = useRef<Set<string>>(new Set(initialOrders.map((o) => o.id)));
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    initialOrders.forEach((o) => seenIds.current.add(o.id));
  }, [initialOrders]);

  useEffect(() => {
    const t = window.setInterval(() => {
      void supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("seller_id", seller.id)
        .order("created_at", { ascending: false })
        .limit(200)
        .then(({ data, error }) => {
          if (!error && data) setOrders(data as Order[]);
        });
    }, 60_000);
    return () => window.clearInterval(t);
  }, [seller.id, setOrders, supabase]);

  useEffect(() => {
    for (const o of typed) {
      if (!seenIds.current.has(o.id)) {
        seenIds.current.add(o.id);
        setNewIds((prev) => new Set(prev).add(o.id));
        window.setTimeout(() => {
          setNewIds((prev) => {
            const n = new Set(prev);
            n.delete(o.id);
            return n;
          });
        }, 900);
      }
    }
  }, [typed]);

  const board = useMemo(() => {
    const active = typed.filter((o) => o.status !== "cancelled");
    return {
      pending: active.filter((o) => o.status === "pending"),
      confirmed: active.filter((o) => o.status === "confirmed" || o.status === "paid"),
      out: active.filter((o) => o.status === "out_for_delivery"),
      delivered: active.filter((o) => o.status === "delivered"),
    };
  }, [typed]);

  const stats = useMemo(() => {
    const t0 = startOfToday();
    const today = typed.filter((o) => new Date(o.created_at) >= t0 && o.status !== "cancelled");
    const revenue = today
      .filter((o) => o.payment_status === "paid" || o.payment_status === "cod_collected")
      .reduce((s, o) => s + Number(o.total_amount ?? 0), 0);
    const paidCount = today.filter((o) => o.payment_status === "paid" || o.payment_status === "cod_collected").length;
    const pendingNow = board.pending.length;
    return { total: today.length, revenue, paidCount, pendingNow };
  }, [typed, board.pending.length]);

  const updateOrder = useCallback(
    (o: Order) => {
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...o } : x)));
    },
    [setOrders],
  );

  const patchOrder = useCallback(
    async (order: OrderWithItems, updates: Partial<Order>) => {
      const prev = { ...order };
      updateOrder({ ...order, ...updates });
      const { error } = await supabase.from("orders").update(updates).eq("id", order.id);
      if (error) {
        updateOrder(prev);
        toast(error.message, "error");
      }
    },
    [supabase, updateOrder, toast],
  );

  return (
    <>
      <div className="px-3 py-4 md:px-6 md:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Today's orders" value={stats.total} />
          <StatCard label="Today's revenue" value={Math.round(stats.revenue).toLocaleString("en-IN")} prefix="₹" />
          <StatCard
            label="Pending right now"
            value={stats.pendingNow}
            valueTone={stats.pendingNow > 0 ? "warning" : "default"}
          />
          <StatCard label="Paid orders" value={stats.paidCount} valueTone="success" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-3">
          <KanbanColumn title="Pending" count={board.pending.length}>
            {board.pending.length === 0 ? (
              <EmptyState title="No pending orders" description="New WhatsApp orders appear here in real time." />
            ) : (
              board.pending.map((o) => (
                <BoardOrderCard
                  key={o.id}
                  order={o}
                  nowMs={nowMs}
                  isNew={newIds.has(o.id)}
                  onOpen={() => setPanel(o)}
                  onPatch={(u) => void patchOrder(o, u)}
                />
              ))
            )}
          </KanbanColumn>
          <KanbanColumn title="Confirmed" count={board.confirmed.length}>
            {board.confirmed.length === 0 ? (
              <EmptyState title="No confirmed orders" description="Confirm pending orders to move them here." />
            ) : (
              board.confirmed.map((o) => (
                <BoardOrderCard key={o.id} order={o} nowMs={nowMs} onOpen={() => setPanel(o)} onPatch={(u) => void patchOrder(o, u)} />
              ))
            )}
          </KanbanColumn>
          <KanbanColumn title="Out for delivery" count={board.out.length}>
            {board.out.length === 0 ? (
              <EmptyState title="Nothing out" description="Dispatch confirmed orders when the rider leaves." />
            ) : (
              board.out.map((o) => (
                <BoardOrderCard key={o.id} order={o} nowMs={nowMs} onOpen={() => setPanel(o)} onPatch={(u) => void patchOrder(o, u)} />
              ))
            )}
          </KanbanColumn>
          <KanbanColumn title="Delivered" count={board.delivered.length}>
            {board.delivered.length === 0 ? (
              <EmptyState title="No deliveries yet" description="Completed orders land here." />
            ) : (
              board.delivered.map((o) => (
                <BoardOrderCard key={o.id} order={o} nowMs={nowMs} dimmed onOpen={() => setPanel(o)} onPatch={(u) => void patchOrder(o, u)} />
              ))
            )}
          </KanbanColumn>
        </div>
      </div>

      {panel && (
        <OrderDetailPanel
          order={panel}
          onClose={() => setPanel(null)}
          onSaved={() => {
            setPanel(null);
          }}
          onOrderUpdate={updateOrder}
        />
      )}
    </>
  );
}

function KanbanColumn({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <Card padding="sm" className="flex max-h-[calc(100vh-14rem)] min-h-[200px] flex-col lg:max-h-[calc(100vh-12rem)]">
      <div className="flex shrink-0 items-center justify-between border-b border-porter-bg-border px-2 py-2">
        <span className="text-label text-porter-text-muted">{title}</span>
        <Badge kind="status" variant="paid" label={String(count)} size="sm" className="!bg-porter-bg-raised !text-porter-text-secondary !ring-porter-bg-border" />
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-3">{children}</div>
    </Card>
  );
}

function BoardOrderCard({
  order,
  nowMs,
  onOpen,
  onPatch,
  dimmed,
  isNew,
}: {
  order: OrderWithItems;
  nowMs: number;
  onOpen: () => void;
  onPatch: (u: Partial<Order>) => void;
  dimmed?: boolean;
  isNew?: boolean;
}) {
  const pay = paymentBadge(order);
  const status = orderStatusBadge(order.status);
  const urgency = pendingTimeUrgency(order.status, order.created_at, nowMs);

  const actions = (
    <>
      {order.status === "pending" && (
        <>
          <Button size="sm" type="button" onClick={() => onPatch({ status: "confirmed" })}>
            <Check className="h-4 w-4" />
            Confirm
          </Button>
          <Button size="sm" type="button" variant="ghost" className="text-porter-status-cancelled hover:text-porter-status-cancelled" onClick={() => onPatch({ status: "cancelled" })}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </>
      )}
      {(order.status === "confirmed" || order.status === "paid") && (
        <Button size="sm" type="button" onClick={() => onPatch({ status: "out_for_delivery" })}>
          <Bike className="h-4 w-4" />
          Dispatch
        </Button>
      )}
      {order.status === "out_for_delivery" && (
        <Button
          size="sm"
          type="button"
          onClick={() => onPatch({ status: "delivered", delivered_at: new Date().toISOString() })}
        >
          <Package className="h-4 w-4" />
          Delivered
        </Button>
      )}
      {order.payment_method === "cod" && order.payment_status === "cod_pending" && (
        <Button
          size="sm"
          type="button"
          className="bg-porter-orange-500 hover:bg-porter-orange-600"
          onClick={() => onPatch({ payment_status: "cod_collected" })}
        >
          Mark cash collected
        </Button>
      )}
    </>
  );

  return (
    <UiOrderCard
      customerName={order.customer_name || "Customer"}
      phone={order.customer_phone}
      itemsSummary={itemSummaryLine(order.order_items)}
      totalFormatted={formatCurrencyInr(order.total_amount)}
      statusLabel={status.label}
      statusVariant={status.variant}
      payment={{ label: pay.label, statusVariant: pay.statusVariant, methodLabel: pay.methodLabel }}
      timeLabel={timeAgoLabel(order.created_at, nowMs)}
      timeUrgency={urgency}
      actions={order.status === "delivered" ? undefined : actions}
      dimmed={dimmed}
      isNew={isNew}
      onCardClick={onOpen}
    />
  );
}
