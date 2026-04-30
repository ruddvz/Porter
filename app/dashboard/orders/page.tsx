"use client";

import { OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, type TableColumn } from "@/components/ui/Table";
import { MOCK_ORDERS, orderSubtotal, type MockOrder } from "@/lib/dashboard-mock";
import { MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

type Row = MockOrder;

export default function OrdersHistoryPage() {
  const [data] = useState<Row[]>(MOCK_ORDERS);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MockOrder | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filtered = useMemo(() => {
    return data.filter((o) => {
      const q = search.trim().toLowerCase();
      if (q && !o.customerName.toLowerCase().includes(q) && !o.phone.replace(/\s/g, "").includes(q))
        return false;
      if (status === "all") return true;
      if (status === "pending") return o.column === "pending";
      if (status === "confirmed") return o.column === "confirmed";
      if (status === "paid") return o.paymentStatusVariant === "paid";
      if (status === "cod") return !o.paymentOnline;
      if (status === "delivered") return o.column === "delivered";
      if (status === "cancelled") return false;
      return true;
    });
  }, [data, status, search]);

  const pills = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "paid", label: "Paid" },
    { id: "cod", label: "COD" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ] as const;

  const columns: TableColumn<Row>[] = [
    {
      id: "id",
      header: "Order ID",
      sortable: true,
      cell: (r) => (
        <span className="text-mono text-porter-text-muted">{r.id.slice(0, 8)}</span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (r) => (
        <div>
          <p className="font-semibold text-porter-text-primary">{r.customerName}</p>
          <p className="text-mono text-porter-text-muted">{r.phone}</p>
        </div>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: (r) => {
        const parts = r.items.slice(0, 2).map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`);
        const tail = r.items.length > 2 ? `, +${r.items.length - 2}` : "";
        const full = r.items.map((i) => `${i.name} ×${i.qty}`).join(", ");
        return (
          <span title={full} className="line-clamp-2 max-w-[200px] cursor-default">
            {parts.join(", ")}
            {tail}
          </span>
        );
      },
    },
    {
      id: "total",
      header: "Total",
      className: "text-right",
      sortable: true,
      cell: (r) => (
        <span className="text-mono font-semibold text-porter-text-primary">
          ₹{orderSubtotal(r).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      id: "payment",
      header: "Payment",
      cell: (r) => <Badge variant="status" status={r.paymentStatusVariant} label={r.paymentLabel} size="sm" />,
    },
    {
      id: "status",
      header: "Status",
      cell: (r) => (
        <Badge variant="status" status={r.orderStatusVariant} label={r.orderStatusLabel} size="sm" />
      ),
    },
    {
      id: "time",
      header: "Time",
      sortable: true,
      cell: (r) => <span className="text-xs text-porter-text-muted">{r.createdMinsAgo}m ago</span>,
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <Button
          variant="ghost"
          size="sm"
          className="min-w-11 px-0"
          aria-label="Actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      ),
    },
  ];

  const [sortKey, setSortKey] = useState("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "id") cmp = a.id.localeCompare(b.id);
      else if (sortKey === "total") cmp = orderSubtotal(a) - orderSubtotal(b);
      else if (sortKey === "time") cmp = a.createdMinsAgo - b.createdMinsAgo;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const exportCsv = () => {
    const rows = sorted.map((r) =>
      [r.id.slice(0, 8), r.customerName, r.phone, orderSubtotal(r), r.orderStatusLabel].join(",")
    );
    const blob = new Blob([`id,name,phone,total,status\n${rows.join("\n")}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-space-4">
      <div className="sticky top-14 z-20 -mx-space-4 border-b border-porter-bg-border bg-porter-bg-base/95 px-space-4 py-space-3 backdrop-blur-md sm:-mx-space-6 sm:px-space-6">
        <div className="flex flex-col gap-space-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-space-2 overflow-x-auto pb-1">
            {pills.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setStatus(p.id)}
                className={
                  status === p.id
                    ? "min-h-11 shrink-0 rounded-full bg-porter-green-500 px-space-4 text-sm font-semibold text-porter-bg-base"
                    : "min-h-11 shrink-0 rounded-full border border-porter-bg-border px-space-4 text-sm font-medium text-porter-text-secondary hover:border-porter-green-500/40"
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-space-3">
            <div className="grid w-full grid-cols-2 gap-space-2 sm:w-auto">
              <Input label="From" variant="text" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              <Input label="To" variant="text" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="w-full min-w-[200px] flex-1 sm:max-w-xs">
              <Input
                label="Search"
                variant="text"
                placeholder="Name or phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={exportCsv}>
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={sorted}
        getRowKey={(r) => r.id}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(k, d) => {
          setSortKey(k);
          setSortDir(d);
        }}
        onRowClick={(r) => {
          setSelected(r);
          setPanelOpen(true);
        }}
        emptyTitle="No orders match"
        emptyDescription="Try another filter or search."
      />

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
