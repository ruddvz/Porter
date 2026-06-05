"use client";

import DashboardHomeInsights from "@/components/dashboard/DashboardHomeInsights";
import SetupChecklistCard from "@/components/dashboard/SetupChecklistCard";
import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { useSharedNow } from "@/lib/hooks/useSharedNow";
import {
  LIVE_BOARD_FETCH_LIMIT,
  LIVE_BOARD_RECENT_TERMINAL_DAYS,
  LIVE_BOARD_STATUSES,
} from "@/lib/dashboard-orders-query";
import type { OrderWithItems } from "@/lib/orders-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { SetupCheckItem } from "@/lib/setup-checklist";
import type { Order, OrderStatus, Product, Seller } from "@/types";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import DraggableBoardCard from "./live-board/DraggableBoardCard";
import DroppableColumn from "./live-board/DroppableColumn";
import MobileOrderList from "./live-board/MobileOrderList";
import {
  COLUMN_ORDER,
  columnLabel,
  isAwaitingPayment,
  workflowRank,
  type KanbanColumnId,
} from "./live-board/types";
import { useOrderMutations } from "../hooks/useOrderMutations";

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

const MOBILE_LAYOUT_KEY = "porter-live-board-layout";

export default function LiveOrdersBoard({
  seller,
  initialOrders,
  lowStockProducts,
  setupChecklist,
}: {
  seller: Seller;
  initialOrders: OrderWithItems[];
  lowStockProducts: Product[];
  setupChecklist: SetupCheckItem[];
}) {
  const nowMs = useSharedNow();
  const supabase = createSupabaseBrowserClient();
  const [soundOn, setSoundOn] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const { orders, setOrders } = useRealtimeOrders(seller.id, initialOrders, { playSoundOnNewOrder: soundOn });
  const typed = orders as OrderWithItems[];
  const { updateOrder, patchOrder } = useOrderMutations(setOrders);
  const [panel, setPanel] = useState<OrderWithItems | null>(null);
  const seenIds = useRef<Set<string>>(new Set(initialOrders.map((o) => o.id)));
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [from, setFrom] = useState(defaultFromIso);
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [boardSearch, setBoardSearch] = useState("");
  const [mobileLayout, setMobileLayout] = useState<"board" | "list">("list");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MOBILE_LAYOUT_KEY);
      if (saved === "board" || saved === "list") setMobileLayout(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MOBILE_LAYOUT_KEY, mobileLayout);
    } catch {
      /* ignore */
    }
  }, [mobileLayout]);

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
    const terminalSince = new Date();
    terminalSince.setDate(terminalSince.getDate() - LIVE_BOARD_RECENT_TERMINAL_DAYS);
    const terminalSinceIso = terminalSince.toISOString();
    const t = window.setInterval(() => {
      void Promise.all([
        supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("seller_id", seller.id)
          .in("status", LIVE_BOARD_STATUSES)
          .order("created_at", { ascending: false })
          .limit(LIVE_BOARD_FETCH_LIMIT),
        supabase
          .from("orders")
          .select("*, order_items(*)")
          .eq("seller_id", seller.id)
          .in("status", ["delivered", "cancelled"])
          .gte("created_at", terminalSinceIso)
          .order("created_at", { ascending: false })
          .limit(40),
      ]).then(([activeRes, terminalRes]) => {
        if (activeRes.error || terminalRes.error) return;
        const merged = [...(activeRes.data ?? []), ...(terminalRes.data ?? [])];
        const ids = new Set<string>();
        const next = merged
          .filter((o) => {
            if (ids.has(o.id)) return false;
            ids.add(o.id);
            return true;
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, LIVE_BOARD_FETCH_LIMIT);
        setOrders(next as OrderWithItems[]);
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
      if (from && new Date(o.created_at) < new Date(from)) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (new Date(o.created_at) > end) return false;
      }
      return true;
    });
  }, [typed, from, to]);

  const searchFiltered = useMemo(() => {
    const q = boardSearch.trim().toLowerCase();
    if (!q) return inRange;
    return inRange.filter((o) => {
      const idShort = o.id.slice(0, 8).toLowerCase();
      const phone = o.customer_phone.toLowerCase().replace(/\s/g, "");
      const name = (o.customer_name ?? "").toLowerCase();
      const qDigits = q.replace(/\D/g, "");
      const phoneDigits = o.customer_phone.replace(/\D/g, "");
      return (
        idShort.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        (qDigits.length >= 4 && phoneDigits.includes(qDigits))
      );
    });
  }, [inRange, boardSearch]);

  const sortedSwimlaneOrders = useMemo(() => {
    const arr = [...searchFiltered];
    arr.sort((a, b) => {
      const ra = workflowRank(a);
      const rb = workflowRank(b);
      if (ra !== rb) return ra - rb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return arr;
  }, [searchFiltered]);

  const board = useMemo(() => {
    const cancelled = searchFiltered.filter((o) => o.status === "cancelled");
    const active = searchFiltered.filter((o) => o.status !== "cancelled");
    const pendingAll = active.filter((o) => o.status === "pending");
    const awaitingPay = pendingAll.filter(isAwaitingPayment);
    const pendingRest = pendingAll.filter((o) => !isAwaitingPayment(o));
    return {
      pending: pendingRest,
      awaiting_payment: awaitingPay,
      confirmed: active.filter((o) => o.status === "confirmed"),
      preparing: active.filter((o) => o.status === "preparing"),
      paid: active.filter((o) => o.status === "paid"),
      out_for_delivery: active.filter((o) => o.status === "out_for_delivery"),
      delivered: active.filter((o) => o.status === "delivered"),
      cancelled,
    };
  }, [searchFiltered]);

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

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const overId = event.over?.id as string | undefined;
      const activeId = event.active.id as string;
      if (!overId || !activeId) return;
      const order = typed.find((o) => o.id === activeId);
      if (!order) return;
      if (overId === "cancelled") {
        void patchOrder(order, { status: "cancelled" });
        return;
      }
      if (overId === "awaiting_payment") {
        if (order.payment_method === "cod") return;
        if (order.status !== "pending") return;
        const method = order.payment_method === "razorpay" ? "razorpay" : "upi_manual";
        void patchOrder(order, { payment_method: method, payment_status: "unpaid" });
        return;
      }
      if (COLUMN_ORDER.includes(overId as KanbanColumnId) && overId !== "awaiting_payment") {
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
        <SetupChecklistCard items={setupChecklist} />

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Today's orders" value={stats.total} />
          <StatCard label="Today's revenue" value={Math.round(stats.revenue).toLocaleString("en-IN")} prefix="₹" />
          <StatCard
            label="Pending right now"
            value={stats.pendingNow}
            valueTone={stats.pendingNow > 0 ? "warning" : "default"}
          />
          <StatCard label="Paid orders" value={stats.paidCount} valueTone="success" />
        </div>

        <DashboardHomeInsights orders={typed} lowStockProducts={lowStockProducts} />

        <Card padding="md" className="mt-4 space-y-3">
          <p className="text-label text-porter-text-muted">Kanban date range</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input.Text id="kb-from" type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input.Text id="kb-to" type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Input.Text
            id="kb-search"
            label="Search board"
            inputVariant="search"
            value={boardSearch}
            onChange={(e) => setBoardSearch(e.target.value)}
            placeholder="Name, phone, or order #"
          />
        </Card>

        <div className="mt-4 flex rounded-xl border border-porter-bg-border bg-porter-bg-surface p-1 xl:hidden">
          <button
            type="button"
            className={cn(
              "min-h-11 flex-1 rounded-lg px-3 text-sm font-semibold transition-colors",
              mobileLayout === "board" ? "bg-porter-green-500/20 text-porter-green-400" : "text-porter-text-secondary",
            )}
            onClick={() => setMobileLayout("board")}
          >
            Board
          </button>
          <button
            type="button"
            className={cn(
              "min-h-11 flex-1 rounded-lg px-3 text-sm font-semibold transition-colors",
              mobileLayout === "list" ? "bg-porter-green-500/20 text-porter-green-400" : "text-porter-text-secondary",
            )}
            onClick={() => setMobileLayout("list")}
          >
            List
          </button>
        </div>

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div
            className={cn(
              "mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] xl:grid xl:snap-none xl:grid-cols-8 xl:gap-2 xl:overflow-visible xl:pb-0 [&::-webkit-scrollbar]:hidden",
              mobileLayout === "list" && "max-xl:hidden",
            )}
            ref={boardRef}
          >
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

        <div className={cn("mt-6 space-y-3 xl:hidden", mobileLayout === "board" && "hidden")}>
          <MobileOrderList
            orders={sortedSwimlaneOrders}
            nowMs={nowMs}
            newIds={newIds}
            onOpen={setPanel}
            onPatch={patchOrder}
          />
        </div>
      </div>

      {panel && (
        <OrderDetailPanel
          seller={seller}
          order={panel}
          onClose={() => setPanel(null)}
          onSaved={() => setPanel(null)}
          onOrderUpdate={updateOrder}
        />
      )}
    </>
  );
}
