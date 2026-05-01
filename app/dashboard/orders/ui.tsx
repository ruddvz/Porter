"use client";

import OrderDetailPanel from "@/components/orders/OrderDetailPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { OrderWithItems } from "@/lib/orders-ui";
import { formatCurrencyInr, itemSummaryLine, orderStatusBadge, paymentBadge, timeAgoLabel } from "@/lib/orders-ui";
import { useSharedNow } from "@/lib/hooks/useSharedNow";
import type { OrderStatus } from "@/types";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

type StatusFilter = "all" | OrderStatus | "cod" | "paid";

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function OrderHistoryClient({
  sellerId,
  initialOrders,
  pageSize,
}: {
  sellerId: string;
  initialOrders: OrderWithItems[];
  pageSize: number;
}) {
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const nowMs = useSharedNow();
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const [panel, setPanel] = useState<OrderWithItems | null>(null);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialOrders.length >= pageSize);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "pending" && o.status !== "pending") return false;
      if (filter === "confirmed" && o.status !== "confirmed") return false;
      if (filter === "preparing" && o.status !== "preparing") return false;
      if (filter === "paid" && o.payment_status !== "paid") return false;
      if (filter === "cod" && o.payment_method !== "cod") return false;
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

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    const start = nextPage * pageSize;
    const end = start + pageSize - 1;
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .range(start, end);
    setLoadingMore(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    const rows = (data ?? []) as OrderWithItems[];
    setOrders((prev) => {
      const seen = new Set(prev.map((x) => x.id));
      const merged = [...prev];
      for (const r of rows) {
        if (!seen.has(r.id)) merged.push(r);
      }
      return merged;
    });
    setPage(nextPage);
    setHasMore(rows.length >= pageSize);
  }, [page, pageSize, sellerId, supabase, toast]);

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

  const pills: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "preparing", label: "Preparing" },
    { key: "cod", label: "COD" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-4 px-3 py-4 md:px-6 md:py-6">
      <Card padding="md" className="sticky top-14 z-20 space-y-4 border-porter-bg-border bg-porter-bg-base/95 backdrop-blur lg:top-[3.5rem]">
        <div className="flex flex-wrap gap-2">
          {pills.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setFilter(p.key)}
              className={`min-h-11 rounded-full border px-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
                filter === p.key
                  ? "border-porter-green-500 bg-porter-green-500/20 text-porter-green-400"
                  : "border-porter-bg-border bg-porter-bg-surface text-porter-text-secondary hover:border-porter-green-500/40"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Input.Text id="hist-from" label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input.Text id="hist-to" label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Input.Text id="hist-search" label="Search" inputVariant="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or phone" />
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </Card>

      <Table
        columns={[
          {
            key: "id",
            header: "Order ID",
            cell: (o) => <span className="text-mono text-porter-text-muted">{o.id.slice(0, 8)}</span>,
          },
          {
            key: "cust",
            header: "Customer",
            cell: (o) => (
              <div>
                <p className="font-semibold text-porter-text-primary">{o.customer_name || "—"}</p>
                <p className="text-mono text-xs text-porter-text-muted">{o.customer_phone}</p>
              </div>
            ),
          },
          {
            key: "items",
            header: "Items",
            cell: (o) => (
              <span className="line-clamp-2 text-body text-porter-text-secondary" title={itemSummaryLine(o.order_items, 99)}>
                {itemSummaryLine(o.order_items)}
              </span>
            ),
          },
          {
            key: "total",
            header: "Total",
            className: "text-right",
            cell: (o) => <span className="text-mono font-semibold text-porter-text-primary">{formatCurrencyInr(o.total_amount)}</span>,
          },
          {
            key: "pay",
            header: "Payment",
            cell: (o) => {
              const b = paymentBadge(o);
              return <Badge kind="status" variant={b.statusVariant} label={`${b.methodLabel} · ${b.label}`} size="sm" />;
            },
          },
          {
            key: "st",
            header: "Status",
            cell: (o) => {
              const b = orderStatusBadge(o.status);
              return <Badge kind="status" variant={b.variant} label={b.label} size="sm" />;
            },
          },
          {
            key: "time",
            header: "Time",
            cell: (o) => <span className="text-xs text-porter-text-muted">{timeAgoLabel(o.created_at, nowMs)}</span>,
          },
          {
            key: "act",
            header: "",
            className: "w-12",
            cell: (o) => (
              <details className="relative">
                <summary className="inline-flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-porter-bg-raised">
                  <MoreHorizontal className="h-5 w-5 text-porter-text-muted" />
                </summary>
                <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-porter-bg-border bg-porter-bg-raised py-1 shadow-modal">
                  <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-porter-bg-surface" onClick={() => setPanel(o)}>
                    View detail
                  </button>
                  {(o.status === "pending" ||
                    o.status === "confirmed" ||
                    o.status === "preparing" ||
                    o.status === "paid") && (
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-porter-status-cancelled hover:bg-porter-bg-surface"
                      onClick={async () => {
                        if (!confirm("Cancel this order?")) return;
                        const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", o.id);
                        if (error) toast(error.message, "error");
                        else {
                          setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: "cancelled" } : x)));
                          toast("Order cancelled", "success");
                        }
                      }}
                    >
                      Cancel order
                    </button>
                  )}
                </div>
              </details>
            ),
          },
        ]}
        rows={filtered}
        getRowKey={(o) => o.id}
        emptyTitle="No orders in this range"
        emptyDescription="Adjust filters or pick another date range."
        onRowClick={(o) => setPanel(o)}
      />

      {hasMore && (
        <div className="flex justify-center">
          <Button type="button" variant="secondary" loading={loadingMore} onClick={() => void loadMore()}>
            Load more
          </Button>
        </div>
      )}

      {panel && (
        <OrderDetailPanel
          order={panel}
          onClose={() => setPanel(null)}
          onSaved={() => setPanel(null)}
          onOrderUpdate={(o) => setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...o } : x)))}
        />
      )}
    </div>
  );
}
