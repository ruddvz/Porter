"use client";

import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { MOCK_PLATFORM_EVENTS, MOCK_SELLERS } from "@/lib/admin-mock";
import type { AdminSeller } from "@/lib/admin-mock";
import Link from "next/link";

export default function AdminOverviewPage() {
  const active = MOCK_SELLERS.filter((s) => s.status === "active").length;
  const ordersToday = 128;
  const revenueToday = 184000;

  const topToday: AdminSeller[] = [...MOCK_SELLERS]
    .sort((a, b) => b.ordersAllTime - a.ordersAllTime)
    .slice(0, 10)
    .map((s, i) => ({ ...s, ordersAllTime: 12 - i * 2, revenueAllTime: (12 - i * 2) * 450 }));

  const cols: TableColumn<AdminSeller>[] = [
    { id: "store", header: "Store", cell: (r) => r.storeName },
    { id: "city", header: "City", cell: (r) => r.city },
    {
      id: "orders",
      header: "Orders today",
      cell: (r) => <span className="text-mono">{r.ordersAllTime}</span>,
    },
    {
      id: "rev",
      header: "Revenue today",
      cell: (r) => (
        <span className="text-mono font-semibold">₹{r.revenueAllTime.toLocaleString("en-IN")}</span>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      cell: (r) => <Badge variant="plan" plan={r.plan} label={r.plan} />,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <Badge
          variant="status"
          status={r.status === "active" ? "paid" : "cancelled"}
          label={r.status}
          size="sm"
        />
      ),
    },
    {
      id: "act",
      header: "",
      cell: (r) => (
        <Link href={`/admin/sellers/${r.id}/`} className="text-sm font-semibold text-porter-green-400 hover:underline">
          Open
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-space-6">
      <div className="grid grid-cols-2 gap-space-3 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Total sellers (active)" value={active} />
        <StatCard label="New sellers this month" value={2} delta="+1 vs last" deltaType="up" />
        <StatCard label="Orders today (platform)" value={ordersToday} />
        <StatCard label="Revenue today (paid)" value={revenueToday.toLocaleString("en-IN")} prefix="₹" />
        <StatCard label="Active conversations" value={14} />
        <StatCard label="Failed / abandoned today" value={6} highlight="orange" />
      </div>

      <div>
        <h2 className="mb-space-3 text-heading text-porter-text-primary">Top sellers today</h2>
        <Table columns={cols} data={topToday} getRowKey={(r) => r.id} />
      </div>

      <div>
        <h2 className="mb-space-3 text-heading text-porter-text-primary">Recent platform events</h2>
        <Card padding="none">
          <ul className="divide-y divide-porter-bg-border">
            {MOCK_PLATFORM_EVENTS.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-space-3 px-space-4 py-space-3 text-sm">
                <span className="text-mono text-porter-text-muted">{new Date(e.at).toLocaleString()}</span>
                <span className="font-medium text-porter-text-primary">{e.adminEmail}</span>
                <span className="text-porter-orange-500">{e.eventType}</span>
                {e.sellerName && <span className="text-porter-text-secondary">→ {e.sellerName}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
