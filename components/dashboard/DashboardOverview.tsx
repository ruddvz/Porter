"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { useRealtimeOrders } from "@/lib/hooks/useRealtimeOrders";
import { useSharedNow } from "@/lib/hooks/useSharedNow";
import type { OrderWithItems } from "@/lib/orders-ui";
import { formatCurrencyInr, itemSummaryLine, orderStatusBadge, timeAgoLabel } from "@/lib/orders-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Product, Seller } from "@/types";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type OverviewStats = {
  revenueToday: number;
  ordersToday: number;
  pendingCount: number;
  fulfillmentPct: number;
};

export default function DashboardOverview({
  seller,
  initialOrders,
  stats,
  chartPoints,
  lowStockProducts,
}: {
  seller: Seller;
  initialOrders: OrderWithItems[];
  stats: OverviewStats;
  chartPoints: { date: string; revenue: number }[];
  lowStockProducts: Pick<Product, "id" | "name" | "stock_quantity" | "min_stock_alert">[];
}) {
  const { orders } = useRealtimeOrders(seller.id, initialOrders);
  const [range, setRange] = useState<"today" | "7d">("7d");
  const nowMs = useSharedNow();

  const recent = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [orders]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const chartData = range === "today" ? chartPoints.slice(-1) : chartPoints;

  const refreshLowStock = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("products")
      .select("id,name,stock_quantity,min_stock_alert")
      .eq("seller_id", seller.id)
      .order("stock_quantity", { ascending: true })
      .limit(20);
    return data ?? [];
  }, [seller.id]);

  const [lowStock, setLowStock] = useState(lowStockProducts);

  return (
    <div className="space-y-6 px-3 py-4 md:px-6 md:py-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-heading text-porter-text-primary">
            {greeting}, {seller.store_name.split(" ")[0]} <span aria-hidden>👋</span>
          </h1>
          <p className="text-body text-porter-text-secondary">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            — {seller.store_name}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRange("today")}
            className={cn(
              "rounded-[var(--radius-sm)] px-3 py-1.5 font-mono text-xs",
              range === "today"
                ? "bg-[--accent] text-black"
                : "border border-porter-bg-border text-porter-text-secondary hover:bg-porter-bg-raised",
            )}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setRange("7d")}
            className={cn(
              "rounded-[var(--radius-sm)] px-3 py-1.5 font-mono text-xs",
              range === "7d"
                ? "bg-[--accent] text-black"
                : "border border-porter-bg-border text-porter-text-secondary hover:bg-porter-bg-raised",
            )}
          >
            Last 7 days
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenue (today)" value={formatCurrencyInr(stats.revenueToday)} />
        <StatCard label="Orders (today)" value={String(stats.ordersToday)} />
        <StatCard
          label="Pending"
          value={String(stats.pendingCount)}
          valueTone={stats.pendingCount > 0 ? "warning" : "default"}
        />
        <StatCard label="Fulfillment (30d)" value={`${stats.fulfillmentPct}%`} />
      </div>

      <Card padding="md" className="border-porter-bg-border">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-title text-porter-text-primary">Revenue trend</h2>
          <span className="text-label text-porter-text-muted">{range === "today" ? "Today" : "Last 14 days"}</span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#5a5a5a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5a5a5a", fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatCurrencyInr(v), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--accent)" fill="url(#revFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" className="border-porter-bg-border">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-title text-porter-text-primary">Recent orders</h2>
            <Link href="/dashboard/orders" className="text-mono text-xs text-[--accent] hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <EmptyState title="No orders yet" description="When WhatsApp orders arrive, they appear here live." />
          ) : (
            <ul className="divide-y divide-porter-bg-border">
              {recent.map((o) => {
                const sb = orderStatusBadge(o.status);
                return (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-porter-text-primary">
                        #{o.id.slice(0, 8)} · {o.customer_name ?? o.customer_phone}
                      </p>
                      <p className="truncate text-xs text-porter-text-muted">{itemSummaryLine(o.order_items, 2)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge label={sb.label} variant={sb.variant} kind="status" size="sm" />
                      <span className="text-mono text-xs text-porter-text-muted">{timeAgoLabel(o.created_at, nowMs)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card padding="md" className="border-porter-bg-border">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-title text-porter-text-primary">Low stock</h2>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                void refreshLowStock().then((rows) =>
                  setLowStock(rows as Pick<Product, "id" | "name" | "stock_quantity" | "min_stock_alert">[]),
                )
              }
            >
              Refresh
            </Button>
          </div>
          {lowStock.length === 0 ? (
            <EmptyState title="Stock levels OK" description="No SKUs below your alert threshold." />
          ) : (
            <ul className="space-y-2">
              {lowStock.map((p) => {
                const sq = p.stock_quantity ?? 0;
                const minA = p.min_stock_alert ?? 5;
                const low = sq > 0 && sq <= minA;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-[var(--radius-sm)] border border-porter-bg-border px-3 py-2"
                  >
                    <span className="truncate text-sm text-porter-text-primary">{p.name}</span>
                    <span
                      className={cn(
                        "badge shrink-0",
                        sq <= 0 ? "badge-red" : low ? "badge-yellow" : "badge-muted",
                      )}
                    >
                      {sq <= 0 ? "Out" : `${sq} left`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href="/dashboard/inventory" className="mt-4 inline-block text-mono text-xs text-[--accent] hover:underline">
            Manage inventory →
          </Link>
        </Card>
      </div>
    </div>
  );
}
