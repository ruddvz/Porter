"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { pctDelta } from "@/lib/month-compare";

const COLORS = ["#25D366", "#FF6B35", "#60A5FA", "#F59E0B", "#A3E635"];

const COLORS = ["#25D366", "#FF6B35", "#60A5FA", "#F59E0B", "#A3E635"];

export default function AdminAnalyticsClient({
  dailyOrders,
  revenueTop,
  paySplit,
  signups,
  periodCompare,
}: {
  dailyOrders: { date: string; count: number }[];
  revenueTop: { name: string; revenue: number }[];
  paySplit: { name: string; value: number }[];
  signups: { date: string; count: number }[];
  periodCompare: {
    labelCurrent: string;
    labelPrevious: string;
    currentOrders: number;
    currentRevenue: number;
    previousOrders: number;
    previousRevenue: number;
  };
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-porter-bg-border bg-porter-bg-surface p-4">
          <p className="text-label text-porter-text-muted">{periodCompare.labelCurrent} · orders</p>
          <p className="mt-1 font-display text-2xl text-porter-text-primary">{periodCompare.currentOrders}</p>
          <p className="mt-2 text-xs text-porter-text-muted">
            {periodCompare.labelPrevious}: {periodCompare.previousOrders}{" "}
            <span className="font-medium text-porter-text-secondary">({pctDelta(periodCompare.currentOrders, periodCompare.previousOrders)})</span>
          </p>
        </div>
        <div className="rounded-lg border border-porter-bg-border bg-porter-bg-surface p-4">
          <p className="text-label text-porter-text-muted">{periodCompare.labelCurrent} · paid revenue</p>
          <p className="mt-1 font-display text-2xl text-porter-text-primary">
            ₹{Math.round(periodCompare.currentRevenue).toLocaleString("en-IN")}
          </p>
          <p className="mt-2 text-xs text-porter-text-muted">
            {periodCompare.labelPrevious}: ₹{Math.round(periodCompare.previousRevenue).toLocaleString("en-IN")}{" "}
            <span className="font-medium text-porter-text-secondary">({pctDelta(periodCompare.currentRevenue, periodCompare.previousRevenue)})</span>
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
      <div className="h-72">
        <h3 className="mb-2 text-title">Daily orders (30d)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyOrders}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D22" />
            <XAxis dataKey="date" tick={{ fill: "#A3B8A8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#A3B8A8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111A14", border: "1px solid #1E2D22" }} />
            <Legend />
            <Line type="monotone" dataKey="count" name="Orders" stroke="#25D366" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72">
        <h3 className="mb-2 text-title">Revenue by seller (top 10, 30d)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueTop}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D22" />
            <XAxis dataKey="name" tick={{ fill: "#A3B8A8", fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: "#A3B8A8", fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`} contentStyle={{ background: "#111A14", border: "1px solid #1E2D22" }} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#FF6B35" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72">
        <h3 className="mb-2 text-title">Payment method split (30d)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={paySplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {paySplit.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#111A14", border: "1px solid #1E2D22" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="h-72">
        <h3 className="mb-2 text-title">New seller signups (90d)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={signups}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D22" />
            <XAxis dataKey="date" tick={{ fill: "#A3B8A8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#A3B8A8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#111A14", border: "1px solid #1E2D22" }} />
            <Legend />
            <Line type="monotone" dataKey="count" name="Signups" stroke="#60A5FA" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    </div>
  );
}
