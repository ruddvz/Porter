import AdminActivityFeed from "@/components/admin/AdminActivityFeed";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Table } from "@/components/ui/Table";
import { fetchRecentPlatformEvents } from "@/lib/admin-platform-events";
import { fetchAdminOverview } from "@/lib/admin-overview";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const data = await fetchAdminOverview();
  const initialEvents = await fetchRecentPlatformEvents(40);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-heading">Platform overview</h1>
          <p className="mt-1 text-body text-porter-text-secondary">Live snapshot across all sellers.</p>
        </div>
        <a
          href="/api/admin/export/orders"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-porter-bg-border bg-transparent px-3 text-sm font-semibold text-porter-text-primary hover:bg-porter-bg-raised"
        >
          Download orders CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active sellers" value={data.totalSellersActive} />
        <StatCard label="New sellers (month)" value={data.newSellersThisMonth} />
        <StatCard label="Orders today" value={data.ordersToday} />
        <StatCard label="Revenue today" value={Math.round(data.revenueToday).toLocaleString("en-IN")} prefix="₹" />
        <StatCard label="Active conversations" value={data.activeConversations} />
        <StatCard label="Failed / stale (today)" value={data.failedOrStaleToday} valueTone="warning" />
      </div>

      <Card padding="md">
        <h2 className="text-title">Top sellers today</h2>
        <div className="mt-4">
          <Table
            columns={[
              {
                key: "store",
                header: "Store",
                cell: (r) => (
                  <Link className="font-semibold text-porter-green-400 hover:underline" href={`/admin/sellers/${r.seller_id}`}>
                    {r.store_name}
                  </Link>
                ),
              },
              { key: "city", header: "City", cell: (r) => r.city ?? "—" },
              { key: "orders", header: "Orders", cell: (r) => String(r.orders) },
              {
                key: "rev",
                header: "Revenue",
                cell: (r) => <span className="text-mono">₹{Math.round(r.revenue).toLocaleString("en-IN")}</span>,
              },
              { key: "plan", header: "Plan", cell: (r) => r.plan },
            ]}
            rows={data.topSellersToday}
            getRowKey={(r) => r.seller_id}
            emptyTitle="No orders yet today"
            emptyDescription="When sellers take orders, they will appear here."
          />
        </div>
      </Card>

      <AdminActivityFeed initial={initialEvents} />

      <Card padding="md">
        <h2 className="text-title">Recent platform events (snapshot)</h2>
        <div className="mt-4">
          <Table
            columns={[
              { key: "t", header: "Time", cell: (r) => <span className="text-mono text-porter-text-muted">{new Date(r.created_at).toLocaleString()}</span> },
              { key: "admin", header: "Admin", cell: (r) => r.admin_email ?? "—" },
              { key: "type", header: "Event", cell: (r) => r.event_type },
              { key: "notes", header: "Notes", cell: (r) => r.notes ?? "—" },
            ]}
            rows={data.recentEvents}
            getRowKey={(r) => r.id}
            emptyTitle="No audit events"
            emptyDescription="Platform actions will be logged here."
          />
        </div>
      </Card>
    </div>
  );
}
