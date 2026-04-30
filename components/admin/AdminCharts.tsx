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
import { porterColors } from "@/lib/design-tokens";

const tick = { fill: porterColors.text.muted, fontSize: 11 };
const grid = { stroke: porterColors.bg.border };

export function AdminDailyOrdersChart({ data }: { data: { day: string; orders: number }[] }) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} />
          <XAxis dataKey="day" tick={tick} interval="preserveStartEnd" />
          <YAxis tick={tick} width={36} />
          <Tooltip
            contentStyle={{
              backgroundColor: porterColors.bg.raised,
              border: `1px solid ${porterColors.bg.border}`,
              borderRadius: 8,
              color: porterColors.text.primary,
            }}
          />
          <Legend wrapperStyle={{ color: porterColors.text.secondary }} />
          <Line
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke={porterColors.green[500]}
            strokeWidth={2}
            dot={{ fill: porterColors.green[500], r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminSellerRevenueChart({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} horizontal={false} />
          <XAxis type="number" tick={tick} />
          <YAxis type="category" dataKey="name" width={100} tick={tick} />
          <Tooltip
            contentStyle={{
              backgroundColor: porterColors.bg.raised,
              border: `1px solid ${porterColors.bg.border}`,
              borderRadius: 8,
              color: porterColors.text.primary,
            }}
            formatter={(v) => {
              const n = typeof v === "number" ? v : Number(v);
              const val = Number.isFinite(n) ? n : 0;
              return [`₹${(val * 10000).toLocaleString("en-IN")} (×10k)`, "Revenue"];
            }}
          />
          <Bar dataKey="revenue" name="Revenue (×10k ₹)" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? porterColors.green[600] : porterColors.green[500]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminPaymentPieChart({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={88}
            paddingAngle={2}
            label={({ name, percent }) =>
              `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} stroke={porterColors.bg.border} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: porterColors.bg.raised,
              border: `1px solid ${porterColors.bg.border}`,
              borderRadius: 8,
              color: porterColors.text.primary,
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminSignupsChart({ data }: { data: { day: number; count: number }[] }) {
  const chartData = data.map((d) => ({ ...d, label: `D${d.day + 1}` }));
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid.stroke} />
          <XAxis dataKey="label" tick={tick} interval={9} />
          <YAxis tick={tick} width={32} />
          <Tooltip
            contentStyle={{
              backgroundColor: porterColors.bg.raised,
              border: `1px solid ${porterColors.bg.border}`,
              borderRadius: 8,
              color: porterColors.text.primary,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            name="New sellers"
            stroke={porterColors.orange[500]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
