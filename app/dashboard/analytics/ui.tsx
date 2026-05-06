"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Table } from "@/components/ui/Table";
import type { Order, OrderItem, Seller } from "@/types";
import { useMemo, useState } from "react";
import { pctDelta } from "@/lib/month-compare";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type OrderRow = Order & { order_items?: OrderItem[] };

function bucketKey(d: Date, mode: "day" | "week" | "month"): string {
  if (mode === "day") return d.toISOString().slice(0, 10);
  if (mode === "week") {
    const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = x.getUTCDay() || 7;
    x.setUTCDate(x.getUTCDate() - day + 1);
    return `W ${x.toISOString().slice(0, 10)}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AnalyticsClient({
  seller,
  initialOrders,
  stats,
  periodCompare,
}: {
  seller: Seller;
  initialOrders: OrderRow[];
  stats: {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    totalCustomers: number;
    productCount: number;
  };
  periodCompare: {
    labelCurrent: string;
    labelPrevious: string;
    currentOrders: number;
    currentRevenue: number;
    previousOrders: number;
    previousRevenue: number;
  };
}) {
  const [range, setRange] = useState<"day" | "week" | "month">("day");
  const [chartScope, setChartScope] = useState<"plan_window" | "this_month" | "last_month">("plan_window");

  const scopedOrders = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    if (chartScope === "plan_window") return initialOrders;
    return initialOrders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      if (chartScope === "this_month") return t >= monthStart.getTime() && t <= now.getTime();
      if (chartScope === "last_month") return t >= prevMonthStart.getTime() && t <= prevMonthEnd.getTime();
      return true;
    });
  }, [initialOrders, chartScope]);

  const paidOrders = useMemo(
    () => scopedOrders.filter((o) => o.payment_status === "paid" || o.payment_status === "cod_collected"),
    [scopedOrders],
  );

  const revenueSeries = useMemo(() => {
    const map = new Map<string, { key: string; revenue: number; orders: number }>();
    for (const o of paidOrders) {
      const k = bucketKey(new Date(o.created_at), range);
      const prev = map.get(k) ?? { key: k, revenue: 0, orders: 0 };
      prev.revenue += Number(o.total_amount ?? 0);
      prev.orders += 1;
      map.set(k, prev);
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [paidOrders, range]);

  const topProducts = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of paidOrders) {
      for (const it of o.order_items ?? []) {
        const prev = m.get(it.product_name) ?? { name: it.product_name, qty: 0, revenue: 0 };
        prev.qty += Number(it.quantity);
        prev.revenue += Number(it.total_price);
        m.set(it.product_name, prev);
      }
    }
    return Array.from(m.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [paidOrders]);

  const customersReturning = useMemo(() => {
    const byPhone = new Map<string, number>();
    for (const o of scopedOrders) {
      const n = byPhone.get(o.customer_phone) ?? 0;
      byPhone.set(o.customer_phone, n + 1);
    }
    let ret = 0;
    let neu = 0;
    for (const c of Array.from(byPhone.values())) {
      if (c > 1) ret++;
      else neu++;
    }
    return { newish: neu, returning: ret };
  }, [scopedOrders]);

  const peakHourBuckets = useMemo(() => {
    const hrs = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 }));
    for (const o of scopedOrders) {
      const h = new Date(o.created_at).getHours();
      hrs[h].orders += 1;
    }
    return hrs;
  }, [scopedOrders]);

  const peakMax = useMemo(() => Math.max(1, ...peakHourBuckets.map((x) => x.orders)), [peakHourBuckets]);

  const scopeHint =
    chartScope === "plan_window"
      ? "Charts use every order in your plan history window."
      : chartScope === "this_month"
        ? "Charts use orders from the 1st of this month through now."
        : "Charts use the previous calendar month only.";

  return (
    <div className="space-y-6 px-3 py-4 md:px-6 md:py-6">
      <div>
        <h1 className="text-heading">Analytics</h1>
        <p className="mt-1 text-body text-porter-text-secondary">
          Plan: <Badge kind="plan" variant={seller.plan === "growth" ? "growth" : "starter"} label={seller.plan} size="sm" /> — history respects plan
          limits.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today's orders" value={stats.todayOrders} />
        <StatCard label="Today's revenue" value={Math.round(stats.todayRevenue).toLocaleString("en-IN")} prefix="₹" />
        <StatCard label="Pending orders" value={stats.pendingOrders} valueTone={stats.pendingOrders > 0 ? "warning" : "default"} />
        <StatCard label="Customers" value={stats.totalCustomers} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card padding="md">
          <p className="text-label text-porter-text-muted">{periodCompare.labelCurrent} · orders</p>
          <p className="mt-1 font-display text-2xl text-porter-text-primary">{periodCompare.currentOrders}</p>
          <p className="mt-2 text-xs text-porter-text-muted">
            {periodCompare.labelPrevious}: {periodCompare.previousOrders}{" "}
            <span className="font-medium text-porter-text-secondary">
              ({pctDelta(periodCompare.currentOrders, periodCompare.previousOrders)})
            </span>
          </p>
        </Card>
        <Card padding="md">
          <p className="text-label text-porter-text-muted">{periodCompare.labelCurrent} · paid revenue</p>
          <p className="mt-1 font-display text-2xl text-porter-text-primary">
            ₹{Math.round(periodCompare.currentRevenue).toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs text-porter-text-muted">
            {periodCompare.labelPrevious}: ₹{Math.round(periodCompare.previousRevenue).toLocaleString("en-IN")}{" "}
            <span className="font-medium text-porter-text-secondary">
              ({pctDelta(periodCompare.currentRevenue, periodCompare.previousRevenue)})
            </span>
          </p>
        </Card>
      </div>

      <Card padding="md" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label text-porter-text-muted">Chart data</span>
          <Button
            type="button"
            size="sm"
            variant={chartScope === "plan_window" ? "primary" : "secondary"}
            onClick={() => setChartScope("plan_window")}
          >
            Plan window
          </Button>
          <Button
            type="button"
            size="sm"
            variant={chartScope === "this_month" ? "primary" : "secondary"}
            onClick={() => setChartScope("this_month")}
          >
            This month
          </Button>
          <Button
            type="button"
            size="sm"
            variant={chartScope === "last_month" ? "primary" : "secondary"}
            onClick={() => setChartScope("last_month")}
          >
            Last month
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-porter-bg-border pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <span className="text-label text-porter-text-muted">Group by</span>
          <Button type="button" size="sm" variant={range === "day" ? "primary" : "secondary"} onClick={() => setRange("day")}>
            Daily
          </Button>
          <Button type="button" size="sm" variant={range === "week" ? "primary" : "secondary"} onClick={() => setRange("week")}>
            Weekly
          </Button>
          <Button type="button" size="sm" variant={range === "month" ? "primary" : "secondary"} onClick={() => setRange("month")}>
            Monthly
          </Button>
        </div>
        <p className="w-full text-xs text-porter-text-muted">{scopeHint}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="text-title">Revenue</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="key" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                <Bar dataKey="revenue" name="₹" fill="#25D366" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card padding="md">
          <h2 className="text-title">Orders (paid)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis dataKey="key" tick={{ fill: "#888", fontSize: 11 }} />
                <YAxis tick={{ fill: "#888", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                <Legend />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#FF6B35" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card padding="md">
        <h2 className="text-title">Peak hours (local)</h2>
        <p className="mt-1 text-xs text-porter-text-muted">{scopeHint}</p>
        <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
          {peakHourBuckets.map((b) => (
            <div key={b.hour} className="flex flex-col items-center gap-1">
              <div
                className="w-full min-h-[6px] rounded-sm bg-porter-green-500/80 transition-opacity"
                style={{ opacity: 0.15 + (0.85 * b.orders) / peakMax, height: `${8 + (44 * b.orders) / peakMax}px` }}
                title={`${b.hour}:00 — ${b.orders} orders`}
              />
              <span className="text-[9px] text-porter-text-muted">{b.hour}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="md">
        <h2 className="text-title">Top products</h2>
        <p className="mt-1 text-xs text-porter-text-muted">Paid orders in the selected chart data scope.</p>
        <Table
          className="mt-4"
          columns={[
            { key: "n", header: "Product", cell: (r) => r.name },
            { key: "q", header: "Qty sold", cell: (r) => r.qty },
            { key: "rev", header: "Revenue", cell: (r) => `₹${Math.round(r.revenue).toLocaleString("en-IN")}` },
          ]}
          rows={topProducts}
          getRowKey={(r) => r.name}
          emptyTitle="No paid orders yet"
          emptyDescription="Revenue from paid orders will populate this table."
        />
      </Card>

      <Card padding="md">
        <h2 className="text-title">Customers in scope</h2>
        <p className="mt-2 text-body text-porter-text-secondary">
          Unique phones with a single order: {customersReturning.newish}. With repeat orders: {customersReturning.returning}.
        </p>
        <p className="mt-2 text-xs text-porter-text-muted">Catalog size: {stats.productCount} products.</p>
      </Card>
    </div>
  );
}
