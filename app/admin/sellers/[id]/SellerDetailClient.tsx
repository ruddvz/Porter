"use client";

import {
  MOCK_CONVERSATIONS,
  MOCK_PRODUCTS_BY_SELLER,
  MOCK_SELLERS,
  MOCK_ADMIN_ORDERS,
  type AdminConversation,
  type AdminOrder,
} from "@/lib/admin-mock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, type TableColumn } from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";

type Tab = "orders" | "inventory" | "conversations";

export function AdminSellerDetail({ sellerId }: { sellerId: string }) {
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  const [tab, setTab] = useState<Tab>("orders");

  if (!seller) {
    notFound();
  }

  const orders = useMemo(
    () => MOCK_ADMIN_ORDERS.filter((o) => o.sellerId === seller.id),
    [seller.id]
  );
  const convos = MOCK_CONVERSATIONS[seller.id] ?? [];
  const products = MOCK_PRODUCTS_BY_SELLER[seller.id] ?? [];
  const inStock = products.filter((p) => p.inStock).length;
  const outStock = products.length - inStock;

  const orderCols: TableColumn<AdminOrder>[] = [
    { id: "oid", header: "Order", cell: (r) => <span className="text-mono text-porter-text-muted">{r.id}</span> },
    { id: "cust", header: "Customer", cell: (r) => `${r.customerName} · ${r.phone}` },
    { id: "tot", header: "Total", cell: (r) => <span className="text-mono">₹{r.total}</span> },
    { id: "pay", header: "Payment", cell: (r) => r.payment },
    { id: "st", header: "Status", cell: (r) => r.status },
  ];

  const convCols: TableColumn<AdminConversation>[] = [
    { id: "ph", header: "Phone", cell: (r) => <span className="text-mono">{r.customerPhone}</span> },
    { id: "st", header: "State", cell: (r) => r.state },
    { id: "lm", header: "Last message", cell: (r) => new Date(r.lastMessageAt).toLocaleString() },
    { id: "nu", header: "Nudges", cell: (r) => r.nudgeCount },
  ];

  return (
    <div className="space-y-space-6">
      <div className="grid gap-space-6 lg:grid-cols-2">
        <Card padding="lg" className="space-y-space-4">
          <div className="flex flex-wrap items-start justify-between gap-space-3">
            <div>
              <h1 className="text-heading text-porter-text-primary">{seller.storeName}</h1>
              <p className="text-mono text-sm text-porter-text-muted">{seller.ownerEmail}</p>
            </div>
            <div className="flex flex-wrap gap-space-2">
              <Badge variant="plan" plan={seller.plan} label={seller.plan} />
              <Badge
                variant="status"
                status={seller.status === "active" ? "paid" : "cancelled"}
                label={seller.status}
              />
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-space-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-label text-porter-text-muted">City</dt>
              <dd className="text-porter-text-primary">{seller.city}</dd>
            </div>
            <div>
              <dt className="text-label text-porter-text-muted">WhatsApp</dt>
              <dd className="text-mono text-porter-text-primary">{seller.whatsapp}</dd>
            </div>
          </dl>
          <div>
            <p className="text-label text-porter-text-muted">Meta WhatsApp</p>
            <p className="text-body text-porter-text-primary">
              Phone ID: {seller.metaPhoneOk ? "Connected" : "Missing"} · Token:{" "}
              {seller.metaTokenOk ? "Set" : "Missing"}
            </p>
          </div>
          <div>
            <p className="text-label text-porter-text-muted">Razorpay</p>
            <p className="text-body text-porter-text-primary">
              Key ID: {seller.razorpayKeyOk ? "Set" : "Missing"} · Secret:{" "}
              {seller.razorpaySecretOk ? "Set" : "Missing"} (values never shown here)
            </p>
          </div>
          <div>
            <p className="text-label text-porter-text-muted">Delivery zones</p>
            <p className="text-body text-porter-text-secondary">{seller.deliveryZones.join(" · ")}</p>
          </div>
          <div className="flex flex-wrap gap-space-2">
            <Button type="button" variant="secondary" size="sm">
              Edit plan
            </Button>
            <Button type="button" variant="danger" size="sm">
              Deactivate
            </Button>
            <Button type="button" variant="ghost" size="sm">
              Send test WhatsApp
            </Button>
            <Link href={`/dashboard/?impersonate=${seller.id}`}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-red-900/40 text-red-200 hover:bg-red-900/60"
              >
                View as seller
              </Button>
            </Link>
          </div>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="flex border-b border-porter-bg-border">
            {(
              [
                { id: "orders" as const, label: "Orders" },
                { id: "inventory" as const, label: "Inventory" },
                { id: "conversations" as const, label: "Conversations" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "min-h-11 flex-1 px-space-3 text-sm font-semibold transition-colors",
                  tab === t.id
                    ? "border-b-2 border-porter-green-500 text-porter-text-primary"
                    : "text-porter-text-muted hover:text-porter-text-secondary"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-space-4">
            {tab === "orders" && (
              <Table columns={orderCols} data={orders} getRowKey={(r) => r.id} emptyTitle="No orders" />
            )}
            {tab === "inventory" && (
              <div className="space-y-space-3 text-body text-porter-text-secondary">
                <p>
                  Products: <strong className="text-porter-text-primary">{products.length}</strong> · In stock:{" "}
                  <strong className="text-porter-text-primary">{inStock}</strong> · Out:{" "}
                  <strong className="text-porter-text-primary">{outStock}</strong>
                </p>
                <ul className="space-y-2">
                  {products.map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center justify-between rounded-lg border border-porter-bg-border px-space-3 py-space-2"
                    >
                      <span className="font-medium text-porter-text-primary">{p.name}</span>
                      <span className="text-mono text-porter-text-muted">
                        ₹{p.price} · {p.inStock ? "In stock" : "Out"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tab === "conversations" && (
              <Table columns={convCols} data={convos} getRowKey={(r) => r.id} emptyTitle="No conversations" />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
