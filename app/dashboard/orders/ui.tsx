"use client";

import type { OrderWithItems } from "@/components/orders/OrderCard";
import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import { useMemo, useState } from "react";

type Filter = "all" | "pending" | "paid" | "delivered" | "cancelled";

/** Filterable order history with CSV export and side panel detail. */
export default function OrderHistoryClient({ initialOrders }: { initialOrders: OrderWithItems[] }) {
  const [orders] = useState(initialOrders);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [panel, setPanel] = useState<OrderWithItems | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "pending" && o.status !== "pending") return false;
      if (filter === "paid" && o.payment_status !== "paid" && o.payment_status !== "cod_collected") return false;
      if (filter === "delivered" && o.status !== "delivered") return false;
      if (filter === "cancelled" && o.status !== "cancelled") return false;
      const q = search.trim().toLowerCase();
      if (q) {
        const name = (o.customer_name ?? "").toLowerCase();
        const phone = o.customer_phone.toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }
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
  }, [orders, filter, search, from, to]);

  function exportCsv() {
    const rows = [
      ["id", "customer", "phone", "total", "status", "payment", "created_at"],
      ...filtered.map((o) => [
        o.id,
        o.customer_name ?? "",
        o.customer_phone,
        String(o.total_amount ?? ""),
        o.status,
        o.payment_status ?? "",
        o.created_at,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "porter-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 py-8">
      <h1 className="font-display text-3xl text-white">Order history</h1>
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "paid", "delivered", "cancelled"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                filter === f ? "bg-[#25D366] text-black" : "bg-white/10 text-white/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white md:w-56"
        />
        <div className="flex gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white" />
        </div>
        <button type="button" onClick={exportCsv} className="rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-semibold text-black">
          Export CSV
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm text-white/80">
          <thead className="bg-black/40 text-xs uppercase text-white/50">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="cursor-pointer border-t border-white/5 hover:bg-white/5" onClick={() => setPanel(o)}>
                <td className="px-3 py-2 font-mono text-xs">{o.id.slice(0, 8)}…</td>
                <td className="px-3 py-2">{o.customer_name || "—"}</td>
                <td className="px-3 py-2">{o.order_items?.length ?? 0}</td>
                <td className="px-3 py-2">₹{o.total_amount}</td>
                <td className="px-3 py-2">{o.payment_status}</td>
                <td className="px-3 py-2 text-xs">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-white/50">No orders in this range.</p>}
      </div>

      {panel && (
        <OrderDetailPanel order={panel} onClose={() => setPanel(null)} onSaved={() => setPanel(null)} />
      )}
    </div>
  );
}
