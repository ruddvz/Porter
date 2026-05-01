"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table } from "@/components/ui/Table";
import type { Seller } from "@/types";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function SellersTable({
  sellers,
  page,
  totalPages,
}: {
  sellers: Seller[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [plan, setPlan] = useState(sp.get("plan") ?? "all");
  const [status, setStatus] = useState(sp.get("status") ?? "all");

  const rows = useMemo(() => sellers, [sellers]);

  function applyFilters() {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (plan !== "all") p.set("plan", plan);
    if (status !== "all") p.set("status", status);
    p.set("page", "1");
    router.push(`/admin/sellers?${p.toString()}`);
  }

  function exportCsv() {
    const header = ["id", "store_name", "whatsapp_number", "city", "plan", "is_active", "created_at"];
    const lines = [header.join(",")];
    for (const s of rows) {
      lines.push(
        [s.id, s.store_name, s.whatsapp_number, s.city ?? "", s.plan, s.is_active, s.created_at]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "porter-sellers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex-1 min-w-[200px]">
          <Input.Text id="seller-q" label="Search" inputVariant="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Store, city, phone" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <select
            className="min-h-11 rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 text-sm text-porter-text-primary"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="all">All plans</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
          </select>
          <select
            className="min-h-11 rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 text-sm text-porter-text-primary"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={applyFilters}>
            Apply
          </Button>
          <Button type="button" variant="secondary" onClick={exportCsv}>
            Export page CSV
          </Button>
        </div>
      </div>

      <Table
        columns={[
          {
            key: "store",
            header: "Store",
            cell: (s) => (
              <Link href={`/admin/sellers/${s.id}`} className="font-semibold text-porter-green-400 hover:underline">
                {s.store_name}
              </Link>
            ),
          },
          { key: "city", header: "City", cell: (s) => s.city ?? "—" },
          { key: "wa", header: "WhatsApp", cell: (s) => <span className="text-mono text-porter-text-muted">{s.whatsapp_number}</span> },
          { key: "plan", header: "Plan", cell: (s) => s.plan },
          {
            key: "status",
            header: "Status",
            cell: (s) => (s.is_active ? <span className="text-porter-green-400">Active</span> : <span className="text-porter-orange-500">Inactive</span>),
          },
          {
            key: "actions",
            header: "",
            className: "w-12",
            cell: (s) => (
              <details className="relative">
                <summary className="inline-flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-porter-bg-surface">
                  <MoreHorizontal className="h-5 w-5" />
                </summary>
                <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-porter-bg-border bg-porter-bg-raised py-1 shadow-modal">
                  <Link className="block px-3 py-2 text-sm hover:bg-porter-bg-surface" href={`/admin/sellers/${s.id}`}>
                    View detail
                  </Link>
                  <Link className="block px-3 py-2 text-sm hover:bg-porter-bg-surface" href={`/admin/sellers/${s.id}#admin-seller-actions`}>
                    Edit plan
                  </Link>
                  <Link
                    className="block px-3 py-2 text-sm text-porter-status-cancelled hover:bg-porter-bg-surface"
                    href={`/admin/sellers/${s.id}#admin-seller-actions`}
                  >
                    Deactivate
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-porter-bg-surface"
                    onClick={async () => {
                      await fetch("/api/admin/impersonate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sellerId: s.id }),
                      });
                      window.location.href = "/dashboard";
                    }}
                  >
                    View as seller
                  </button>
                </div>
              </details>
            ),
          },
        ]}
        rows={rows}
        getRowKey={(s) => s.id}
        emptyTitle="No sellers match"
        emptyDescription="Try widening your search."
      />

      <div className="flex items-center justify-between text-sm text-porter-text-muted">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" disabled={page <= 1} onClick={() => router.push(`/admin/sellers?page=${page - 1}`)}>
            Prev
          </Button>
          <Button type="button" variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => router.push(`/admin/sellers?page=${page + 1}`)}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
