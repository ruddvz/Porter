"use client";

import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
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
import type { Order, OrderStatus, Seller } from "@/types";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Check, MessageCircle, Package, Truck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function defaultFromIso() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

const COLUMN_ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "paid",
  "out_for_delivery",
  "delivered",
];

function columnLabel(s: OrderStatus): string {
  switch (s) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "preparing":
      return "Preparing";
    case "paid":
      return "Paid";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return s;
  }
}

function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const n = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

/** Live kanban: 6 workflow columns + cancelled, drag-and-drop, realtime, gated sound. */
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
  const [soundOn, setSoundOn] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const { orders, setOrders } = useRealtimeOrders(seller.id, initialOrders as Order[], { playSoundOnNewOrder: soundOn });
  const typed = orders as OrderWithItems[];
  const [panel, setPanel] = useState<OrderWithItems | null>(null);
  const seenIds = useRef<Set<string>>(new Set(initialOrders.map((o) => o.id)));
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [from, setFrom] = useState(defaultFromIso);
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const enable = () => setSoundOn(true);
    el.addEventListener("pointerdown", enable, { once: true });
    return () => el.removeEventListener("pointerdown", enable);
  }, []);

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
          if (!error && data) setOrders(data as OrderWithItems[]);
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

  const inRange = useMemo(() => {
    return typed.filter((o) => {
      if (from) {
        if (new Date(o.created_at) < new Date(from)) return false;
      }
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (new Date(o.created_at) > end) return false;
      }
      return true;
    });
  }, [typed, from, to]);

  const board = useMemo(() => {
    const cancelled = inRange.filter((o) => o.status === "cancelled");
    const active = inRange.filter((o) => o.status !== "cancelled");
    return {
      pending: active.filter((o) => o.status === "pending"),
      confirmed: active.filter((o) => o.status === "confirmed"),
      preparing: active.filter((o) => o.status === "preparing"),
      paid: active.filter((o) => o.status === "paid"),
      out_for_delivery: active.filter((o) => o.status === "out_for_delivery"),
      delivered: active.filter((o) => o.status === "delivered"),
      cancelled,
    };
  }, [inRange]);

  const stats = useMemo(() => {
    const t0 = startOfToday();
    const today = typed.filter((o) => new Date(o.created_at) >= t0 && o.status !== "cancelled");
    const revenue = today
      .filter((o) => o.payment_status === "paid" || o.payment_status === "cod_collected")
      .reduce((s, o) => s + Number(o.total_amount ?? 0), 0);
    const paidCount = today.filter((o) => o.payment_status === "paid" || o.payment_status === "cod_collected").length;
    const pendingNow = typed.filter((o) => o.status === "pending").length;
    return { total: today.length, revenue, paidCount, pendingNow };
  }, [typed]);

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

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const overId = event.over?.id as string | undefined;
      const activeId = event.active.id as string;
      if (!overId || !activeId) return;
      const order = typed.find((o) => o.id === activeId);
      if (!order) return;
      if (overId === "cancelled" || COLUMN_ORDER.includes(overId as OrderStatus)) {
        const next = overId as OrderStatus;
        const extra: Partial<Order> = {};
        if (next === "delivered") extra.delivered_at = new Date().toISOString();
        void patchOrder(order, { status: next, ...extra });
      }
    },
    [typed, patchOrder],
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

        <Card padding="md" className="mt-4 space-y-3">
          <p className="text-label text-porter-text-muted">Kanban date range</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input.Text id="kb-from" type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input.Text id="kb-to" type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </Card>

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-7 xl:gap-2" ref={boardRef}>
            {COLUMN_ORDER.map((col) => (
              <DroppableColumn key={col} id={col} title={columnLabel(col)} count={board[col].length}>
                {board[col].length === 0 ? (
                  <EmptyState title={`No ${columnLabel(col)}`} description="Drag cards here or wait for new orders." />
                ) : (
                  board[col].map((o) => (
                    <DraggableBoardCard
                      key={o.id}
                      order={o}
                      nowMs={nowMs}
                      isNew={newIds.has(o.id)}
                      onOpen={() => setPanel(o)}
                      onPatch={(u) => void patchOrder(o, u)}
                    />
                  ))
                )}
              </DroppableColumn>
            ))}
            <DroppableColumn id="cancelled" title="Cancelled" count={board.cancelled.length}>
              {board.cancelled.length === 0 ? (
                <EmptyState title="No cancelled" description="Cancelled orders appear here." />
              ) : (
                board.cancelled.map((o) => (
                  <DraggableBoardCard
                    key={o.id}
                    order={o}
                    nowMs={nowMs}
                    dimmed
                    onOpen={() => setPanel(o)}
                    onPatch={(u) => void patchOrder(o, u)}
                  />
                ))
              )}
            </DroppableColumn>
          </div>
        </DndContext>
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

function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={isOver ? "ring-2 ring-porter-green-500/40 ring-offset-2 ring-offset-porter-bg-base rounded-xl" : ""}>
      <Card padding="sm" className="flex max-h-[calc(100vh-18rem)] min-h-[200px] flex-col xl:max-h-[calc(100vh-14rem)]">
        <div className="flex shrink-0 items-center justify-between border-b border-porter-bg-border px-2 py-2">
          <span className="text-label text-porter-text-muted">{title}</span>
          <Badge
            kind="status"
            variant="paid"
            label={String(count)}
            size="sm"
            className="!bg-porter-bg-raised !text-porter-text-secondary !ring-porter-bg-border"
          />
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-3">{children}</div>
      </Card>
    </div>
  );
}

function DraggableBoardCard({
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.55 : undefined,
  };

  const pay = paymentBadge(order);
  const status = orderStatusBadge(order.status);
  const urgency = pendingTimeUrgency(order.status, order.created_at, nowMs);
  const prefill = `Hi${order.customer_name ? ` ${order.customer_name}` : ""}, regarding order #${order.id.slice(0, 8)} — `;

  const actions = (
    <>
      <Button
        size="sm"
        type="button"
        variant="secondary"
        onClick={() => window.open(waLink(order.customer_phone, prefill), "_blank", "noopener,noreferrer")}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
      {order.status === "pending" && (
        <>
          <Button size="sm" type="button" onClick={() => onPatch({ status: "confirmed" })}>
            <Check className="h-4 w-4" />
            Confirm
          </Button>
          <Button
            size="sm"
            type="button"
            variant="ghost"
            className="text-porter-status-cancelled hover:text-porter-status-cancelled"
            onClick={() => onPatch({ status: "cancelled" })}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </>
      )}
      {(order.status === "confirmed" || order.status === "paid") && (
        <Button size="sm" type="button" onClick={() => onPatch({ status: "preparing" })}>
          <Package className="h-4 w-4" />
          Preparing
        </Button>
      )}
      {(order.status === "preparing" || order.status === "paid") && (
        <Button size="sm" type="button" onClick={() => onPatch({ status: "out_for_delivery" })}>
          <Truck className="h-4 w-4" />
          Dispatch
        </Button>
      )}
      {order.status === "out_for_delivery" && (
        <Button
          size="sm"
          type="button"
          onClick={() => onPatch({ status: "delivered", delivered_at: new Date().toISOString() })}
        >
          <Check className="h-4 w-4" />
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
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
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
        actions={order.status === "delivered" || order.status === "cancelled" ? undefined : actions}
        dimmed={dimmed}
        isNew={isNew}
        onCardClick={onOpen}
      />
    </div>
  );
}
