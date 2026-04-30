"use client";

import { useMemo, useState } from "react";
import { MOCK_ADMIN_ORDERS, MOCK_SELLERS } from "@/lib/admin-mock";
import type { AdminOrder } from "@/lib/admin-mock";
import { Input } from "@/components/ui/Input";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

export default function AdminOrdersPage() {
  const [sellerId, setSellerId] = useState("all");
  const [status, setStatus] = useState("all");
  const [pay, setPay] = useState("all");

  const rows = useMemo(() => {
    return MOCK_ADMIN_ORDERS.filter((o) => {
      if (sellerId !== "all" && o.sellerId !== sellerId) return false;
      if (status !== "all" && o.status !== status) return false;
      if (pay !== "all" && o.payment !== pay) return false;
      return true;
    });
  }, [sellerId, status, pay]);

  const cols: TableColumn<AdminOrder>[] = [
    { id: "store", header: "Store", cell: (r) => r.storeName },
    { id: "oid", header: "Order", cell: (r) => <span className="text-mono text-porter-text-muted">{r.id}</span> },
    { id: "cust", header: "Customer", cell: (r) => `${r.customerName}` },
    { id: "ph", header: "Phone", cell: (r) => <span className="text-mono text-sm">{r.phone}</span> },
    { id: "tot", header: "Total", cell: (r) => <span className="text-mono font-semibold">₹{r.total}</span> },
    { id: "pay", header: "Payment", cell: (r) => r.payment },
    { id: "st", header: "Status", cell: (r) => r.status },
    { id: "at", header: "Time", cell: (r) => new Date(r.createdAt).toLocaleString() },
  ];

  return (
    <div className="space-y-space-4">
      <div className="flex flex-col gap-space-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="grid w-full gap-space-3 sm:grid-cols-2 lg:max-w-2xl lg:flex-1">
          <Input
            label="Seller"
            variant="select"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            options={[{ value: "all", label: "All sellers" }, ...MOCK_SELLERS.map((s) => ({ value: s.id, label: s.storeName }))]}
          />
          <Input
            label="Status"
            variant="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "Pending", label: "Pending" },
              { value: "Delivered", label: "Delivered" },
            ]}
          />
          <Input
            label="Payment"
            variant="select"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            options={[
              { value: "all", label: "All" },
              { value: "COD", label: "COD" },
              { value: "Razorpay", label: "Razorpay" },
            ]}
          />
          <div className="grid grid-cols-2 gap-space-2">
            <Input label="From" variant="text" type="date" />
            <Input label="To" variant="text" type="date" />
          </div>
        </div>
        <Button type="button" variant="secondary">
          Export (API)
        </Button>
      </div>
      <Table columns={cols} data={rows} getRowKey={(r) => r.id} emptyTitle="No orders" />
    </div>
  );
}
