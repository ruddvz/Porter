"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { OrderWithItems } from "@/lib/orders-ui";
import { formatCurrencyInr } from "@/lib/orders-ui";
import type { Product } from "@/types";
import Link from "next/link";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** Plan0 §4 — home trend chart, fulfillment snapshot, recent orders, low-stock hints. */
export default function DashboardHomeInsights({
  orders,
  lowStockProducts,
}: {
  orders: OrderWithItems[];
  lowStockProducts: Product[];
}) {
  const trend = useMemo(() => {
    const days = 14;
    const now = new Date();
    const rows: { key: string; label: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      rows.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}`, count: 0 });
    }
    const map = new Map(rows.map((x) => [x.key, x]));
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const k = new Date(o.created_at).toISOString().slice(0, 10);
      const row = map.get(k);
      if (row) row.count += 1;
    }
    return Array.from(map.values());
  }, [orders]);

  const fulfillmentPct = useMemo(() => {
    const active = orders.filter((o) => o.status !== "cancelled");
    if (!active.length) return 0;
    const delivered = active.filter((o) => o.status === "delivered").length;
    return Math.round((delivered / active.length) * 100);
  }, [orders]);

  const recent = useMemo(() => {
    return [...orders]
      .filter((o) => o.status !== "cancelled")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [orders]);

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-3">
      <Card padding="md" className="lg:col-span-2">
        <h2 className="text-title text-porter-text-primary">Orders trend</h2>
        <p className="mt-1 text-xs text-porter-text-muted">Last 14 days — non-cancelled orders per day</p>
        <div className="mt-4 h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25D366" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#25D366" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="label" tick={{ fill: "#a0a0a0", fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: "#a0a0a0", fontSize: 11 }} width={36} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 8 }}
                labelStyle={{ color: "#f5f5f5" }}
              />
              <Area type="monotone" dataKey="count" stroke="#25D366" fill="url(#dash-area)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card padding="md">
        <h2 className="text-title text-porter-text-primary">Fulfillment</h2>
        <p className="mt-3 font-display text-4xl text-porter-green-400">{fulfillmentPct}%</p>
        <p className="mt-1 text-xs text-porter-text-muted">Delivered ÷ non-cancelled orders on this board</p>
      </Card>

      <Card padding="md" className="lg:col-span-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-title text-porter-text-primary">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-xs font-semibold text-porter-green-400 hover:underline">
            History
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {recent.length === 0 ? (
            <li className="text-sm text-porter-text-muted">No orders yet.</li>
          ) : (
            recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-porter-bg-border bg-porter-bg-surface px-3 py-2 text-sm"
              >
                <span className="font-mono text-porter-text-secondary">#{o.id.slice(0, 8)}</span>
                <span className="text-porter-text-primary">{o.customer_name ?? o.customer_phone}</span>
                <span className="text-porter-text-muted">{o.status}</span>
                <span className="font-semibold text-porter-text-primary">{formatCurrencyInr(Number(o.total_amount ?? 0))}</span>
              </li>
            ))
          )}
        </ul>
      </Card>

      <Card padding="md">
        <h2 className="text-title text-porter-text-primary">Low stock</h2>
        <p className="mt-1 text-xs text-porter-text-muted">Listed catalog items at ≤5 units</p>
        <ul className="mt-3 space-y-2">
          {lowStockProducts.length === 0 ? (
            <li className="text-sm text-porter-text-muted">Nothing flagged.</li>
          ) : (
            lowStockProducts.slice(0, 8).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-porter-text-primary">{p.name}</span>
                <Badge kind="status" variant="cod" label={`${p.stock_quantity ?? 0}`} size="sm" />
              </li>
            ))
          )}
        </ul>
        {lowStockProducts.length > 0 ? (
          <Link href="/dashboard/inventory" className="mt-3 inline-block text-xs text-porter-green-400 hover:underline">
            Open inventory
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
