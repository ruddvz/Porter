"use client";

import { OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderCard } from "@/components/ui/OrderCard";
import { StatCard } from "@/components/ui/StatCard";
import { MOCK_ORDERS, orderSubtotal, type MockOrder } from "@/lib/dashboard-mock";
import { Package } from "lucide-react";
import { useMemo, useState } from "react";

const columns: { key: MockOrder["column"]; title: string }[] = [
  { key: "pending", title: "Pending" },
  { key: "confirmed", title: "Confirmed" },
  { key: "out", title: "Out for delivery" },
  { key: "delivered", title: "Delivered" },
];

function formatRelativeMins(mins: number): string {
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const h = Math.floor(mins / 60);
  return `${h} hr${h > 1 ? "s" : ""} ago`;
}

export default function DashboardPage() {
  const [orders] = useState<MockOrder[]>(MOCK_ORDERS);
  const [selected, setSelected] = useState<MockOrder | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const stats = useMemo(() => {
    const today = orders.length;
    const revenue = orders.reduce((s, o) => s + orderSubtotal(o), 0);
    const pending = orders.filter((o) => o.column === "pending").length;
    const paid = orders.filter((o) => o.paymentStatusVariant === "paid").length;
    return { today, revenue, pending, paid };
  }, [orders]);

  const openDetail = (o: MockOrder) => {
    setSelected(o);
    setPanelOpen(true);
  };

  return (
    <div className="space-y-space-6">
      <div className="grid grid-cols-2 gap-space-3 lg:grid-cols-4">
        <StatCard label="Today's orders" value={stats.today} />
        <StatCard label="Today's revenue" value={stats.revenue.toLocaleString("en-IN")} prefix="₹" />
        <StatCard
          label="Pending right now"
          value={stats.pending}
          highlight={stats.pending > 0 ? "orange" : "none"}
        />
        <StatCard label="Paid orders" value={stats.paid} highlight="green" />
      </div>

      <div className="flex min-h-[calc(100dvh-14rem)] flex-col gap-space-3 lg:flex-row lg:gap-space-4">
        {columns.map((col) => {
          const list = orders.filter((o) => o.column === col.key);
          return (
            <div key={col.key} className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="mb-space-2 flex items-center justify-between gap-space-2">
                <span className="text-label text-porter-text-muted">{col.title}</span>
                <span className="rounded-full border border-porter-bg-border bg-porter-bg-raised px-space-2 py-0.5 text-label text-porter-text-secondary">
                  {list.length}
                </span>
              </div>
              <div className="min-h-[200px] flex-1 space-y-space-3 overflow-y-auto rounded-xl border border-porter-bg-border bg-porter-bg-surface/50 p-space-2 lg:max-h-[calc(100dvh-12rem)]">
                {list.length === 0 ? (
                  <EmptyState
                    title="No orders"
                    description="Orders in this stage appear here."
                    icon={<Package className="h-8 w-8" />}
                    className="min-h-[160px] py-space-6"
                  />
                ) : (
                  list.map((o) => {
                    const sub = orderSubtotal(o);
                    const preview = o.items
                      .slice(0, 2)
                      .map((i) => `${i.name} ${i.qty > 1 ? `×${i.qty}` : ""}`.trim())
                      .join(", ");
                    const more = o.items.length > 2 ? ` +${o.items.length - 2} more` : "";
                    const timeStr = formatRelativeMins(o.createdMinsAgo);
                    const delivered = o.column === "delivered";
                    const actions =
                      o.column === "pending" ? (
                        <>
                          <Button size="sm" variant="primary">
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" className="text-porter-status-cancelled hover:text-porter-status-cancelled">
                            Cancel
                          </Button>
                        </>
                      ) : o.column === "confirmed" ? (
                        <Button size="sm" variant="primary">
                          Dispatch
                        </Button>
                      ) : o.column === "out" ? (
                        <Button size="sm" variant="primary">
                          Delivered
                        </Button>
                      ) : null;

                    return (
                      <OrderCard
                        key={o.id}
                        customerName={o.customerName}
                        phone={o.phone}
                        itemsPreview={preview + more}
                        itemCount={o.items.length}
                        totalRupee={sub}
                        orderStatusVariant={o.orderStatusVariant}
                        orderStatusLabel={o.orderStatusLabel}
                        paymentStatusVariant={o.paymentStatusVariant}
                        paymentStatusLabel={o.paymentLabel}
                        relativeTime={timeStr}
                        pendingMinutes={o.column === "pending" ? o.createdMinsAgo : undefined}
                        delivered={delivered}
                        codPending={!o.paymentOnline && !o.codCollected && o.column !== "delivered"}
                        onCardClick={() => openDetail(o)}
                        actions={actions}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OrderDetailPanel
        order={selected}
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
