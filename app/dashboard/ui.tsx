"use client";

import { OrderCard, type OrderWithItems } from "@/components/orders/OrderCard";
import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import type { Order, Seller } from "@/types";
import { useMemo, useState } from "react";

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
  const { orders, setOrders } = useRealtimeOrders(seller.id, initialOrders as Order[]);
  const typed = orders as OrderWithItems[];
  const [panel, setPanel] = useState<OrderWithItems | null>(null);

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
    const revenue = today.filter((o) => o.payment_status === "paid" || o.payment_status === "cod_collected").reduce((s, o) => s + Number(o.total_amount ?? 0), 0);
    const paidCount = today.filter((o) => o.payment_status === "paid" || o.payment_status === "cod_collected").length;
    const avg = today.length ? revenue / today.length : 0;
    return { total: today.length, revenue, avg, paidCount };
  }, [typed]);

  function updateOrder(o: Order) {
    setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...o } : x)));
  }

  return (
    <>
      <div className="md:hidden">
        <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0F0D]/95 px-4 py-3 backdrop-blur">
          <p className="font-display text-xl text-[#25D366]">PORTER</p>
          <p className="text-sm text-white/80">{seller.store_name}</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="hidden items-center justify-between md:flex">
          <div>
            <h1 className="font-display text-3xl text-white">{seller.store_name}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/60">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
              </span>
              Live
            </p>
          </div>
          <span className="text-2xl opacity-40">🔔</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Orders today" value={String(stats.total)} />
          <Stat label="Revenue" value={`₹${Math.round(stats.revenue)}`} />
          <Stat label="Avg order" value={`₹${stats.total ? Math.round(stats.avg) : 0}`} />
          <Stat label="Paid" value={String(stats.paidCount)} />
        </div>

        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
          <Column title="Pending" count={board.pending.length} orders={board.pending} onUpdate={updateOrder} onOpen={setPanel} />
          <Column title="Confirmed" count={board.confirmed.length} orders={board.confirmed} onUpdate={updateOrder} onOpen={setPanel} />
          <Column title="Out for delivery" count={board.out.length} orders={board.out} onUpdate={updateOrder} onOpen={setPanel} />
          <Column title="Delivered" count={board.delivered.length} orders={board.delivered} onUpdate={updateOrder} onOpen={setPanel} />
        </div>
      </div>

      {panel && (
        <OrderDetailPanel
          order={panel}
          onClose={() => setPanel(null)}
          onSaved={() => {
            setPanel(null);
          }}
        />
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111A14] p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="font-display mt-1 text-2xl text-white">{value}</p>
    </div>
  );
}

function Column({
  title,
  count,
  orders,
  onUpdate,
  onOpen,
}: {
  title: string;
  count: number;
  orders: OrderWithItems[];
  onUpdate: (o: Order) => void;
  onOpen: (o: OrderWithItems) => void;
}) {
  return (
    <div className="min-w-[280px] flex-1 rounded-xl border border-white/10 bg-[#111A14]/80 p-3 md:min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/90">{title}</h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">{count}</span>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-xs text-white/40">No orders yet today. Share your WhatsApp link to get started.</p>
        ) : (
          orders.map((o) => <OrderCard key={o.id} order={o} onUpdate={onUpdate} onOpen={onOpen} />)
        )}
      </div>
    </div>
  );
}
