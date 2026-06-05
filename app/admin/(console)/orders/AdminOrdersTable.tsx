"use client";

import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { TableToCards } from "@/components/ui/TableToCards";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string;
  total_amount: number | null;
  status: string;
  payment_status: string | null;
  sellers: { store_name: string } | null;
};

export default function AdminOrdersTable({ orders, page, totalPages }: { orders: Row[]; page: number; totalPages: number }) {
  const router = useRouter();
  return (
    <Card padding="md" className="space-y-4">
      <TableToCards
        rows={orders}
        getRowKey={(o) => o.id}
        renderCard={(o) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-porter-text-primary">{o.sellers?.store_name ?? "Store"}</p>
                <p className="text-mono text-xs text-porter-text-muted">#{o.id.slice(0, 8)}</p>
              </div>
              <p className="text-lg font-bold tabular-nums text-porter-text-primary">
                ₹{Math.round(Number(o.total_amount ?? 0)).toLocaleString("en-IN")}
              </p>
            </div>
            <p className="text-sm text-porter-text-secondary">{o.customer_name || o.customer_phone}</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={o.status} />
              {o.payment_status ? <PaymentBadge status={o.payment_status} /> : null}
            </div>
            <p className="text-xs text-porter-text-muted">{new Date(o.created_at).toLocaleString()}</p>
          </div>
        )}
      />

      <div className="hidden lg:block">
        <Table
          columns={[
            { key: "store", header: "Store", cell: (o) => o.sellers?.store_name ?? "—" },
            { key: "id", header: "Order", cell: (o) => <span className="text-mono text-porter-text-muted">{o.id.slice(0, 8)}</span> },
            { key: "cust", header: "Customer", cell: (o) => o.customer_name || o.customer_phone },
            { key: "total", header: "Total", cell: (o) => <span className="text-mono">₹{o.total_amount}</span> },
            { key: "pay", header: "Payment", cell: (o) => (o.payment_status ? <PaymentBadge status={o.payment_status} /> : "—") },
            { key: "st", header: "Status", cell: (o) => <StatusBadge status={o.status} /> },
            { key: "t", header: "Time", cell: (o) => <span className="text-mono text-xs text-porter-text-muted">{new Date(o.created_at).toLocaleString()}</span> },
          ]}
          rows={orders}
          getRowKey={(o) => o.id}
          emptyTitle="No orders"
          emptyDescription="—"
        />
      </div>
      <div className="flex items-center justify-between text-sm text-porter-text-muted">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={page <= 1} onClick={() => router.push(`/admin/orders?page=${page - 1}`)}>
            Prev
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => router.push(`/admin/orders?page=${page + 1}`)}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
