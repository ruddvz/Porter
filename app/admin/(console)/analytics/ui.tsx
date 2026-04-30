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

const COLORS = ["#25D366", "#FF6B35", "#60A5FA", "#F59E0B", "#A3E635"];

export default function AdminAnalyticsClient({
  dailyOrders,
  revenueTop,
  paySplit,
  signups,
}: {
  dailyOrders: { date: string; count: number }[];
  revenueTop: { name: string; revenue: number }[];
  paySplit: { name: string; value: number }[];
  signups: { date: string; count: number }[];
}) {
  return (
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
  );
}
