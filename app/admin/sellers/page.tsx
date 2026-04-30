"use client";

import { useMemo, useState } from "react";
import { MOCK_SELLERS, type AdminSeller } from "@/lib/admin-mock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 25;

export default function AdminSellersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState<"all" | "starter" | "growth">("all");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(0);
  const [menuSeller, setMenuSeller] = useState<AdminSeller | null>(null);

  const filtered = useMemo(() => {
    return MOCK_SELLERS.filter((s) => {
      const q = search.toLowerCase();
      const match =
        !q ||
        s.storeName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.whatsapp.replace(/\s/g, "").includes(q);
      const p = plan === "all" || s.plan === plan;
      const st = status === "all" || s.status === status;
      return match && p && st;
    });
  }, [search, plan, status]);

  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const exportCsv = () => {
    const lines = filtered.map(
      (s) =>
        `${s.storeName},${s.ownerEmail},${s.city},${s.whatsapp},${s.plan},${s.ordersAllTime},${s.revenueAllTime}`
    );
    const blob = new Blob([`store,email,city,whatsapp,plan,orders,revenue\n${lines.join("\n")}`], {
      type: "text/csv",
    });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "sellers.csv";
    a.click();
    URL.revokeObjectURL(u);
  };

  const cols: TableColumn<AdminSeller>[] = [
    { id: "store", header: "Store", cell: (r) => r.storeName },
    { id: "email", header: "Owner email", cell: (r) => r.ownerEmail },
    { id: "city", header: "City", cell: (r) => r.city },
    { id: "wa", header: "WhatsApp", cell: (r) => <span className="text-mono text-sm">{r.whatsapp}</span> },
    { id: "plan", header: "Plan", cell: (r) => <Badge variant="plan" plan={r.plan} label={r.plan} /> },
    {
      id: "orders",
      header: "Orders (all-time)",
      cell: (r) => <span className="text-mono">{r.ordersAllTime}</span>,
    },
    {
      id: "rev",
      header: "Revenue (all-time)",
      cell: (r) => (
        <span className="text-mono font-semibold">₹{r.revenueAllTime.toLocaleString("en-IN")}</span>
      ),
    },
    { id: "joined", header: "Joined", cell: (r) => r.joinedAt },
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
      id: "actions",
      header: "",
      cell: (r) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-w-11 px-0"
          aria-label="Actions"
          onClick={(e) => {
            e.stopPropagation();
            setMenuSeller(r);
          }}
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-space-4">
      <div className="flex flex-col gap-space-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-wrap gap-space-2">
          <div className="min-w-[200px] flex-1">
            <Input label="Search" variant="search" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-space-2">
            {(["all", "starter", "growth"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={
                  plan === p
                    ? "min-h-11 rounded-full bg-porter-green-500 px-space-4 text-sm font-semibold text-porter-bg-base"
                    : "min-h-11 rounded-full border border-porter-bg-border px-space-4 text-sm text-porter-text-secondary"
                }
              >
                {p === "all" ? "All plans" : p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-space-2">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={
                  status === s
                    ? "min-h-11 rounded-full bg-porter-orange-500/20 px-space-4 text-sm font-semibold text-porter-orange-500"
                    : "min-h-11 rounded-full border border-porter-bg-border px-space-4 text-sm text-porter-text-secondary"
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <Table
        columns={cols}
        data={pageRows}
        getRowKey={(r) => r.id}
        onRowClick={(r) => {
          router.push(`/admin/sellers/${r.id}/`);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-space-3">
        <p className="text-sm text-porter-text-muted">
          Page {page + 1} · {filtered.length} sellers
        </p>
        <div className="flex gap-space-2">
          <Button type="button" variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={(page + 1) * PAGE_SIZE >= filtered.length}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal open={!!menuSeller} onClose={() => setMenuSeller(null)} title="Seller actions">
        {menuSeller && (
          <div className="flex flex-col gap-space-2">
            <Link
              href={`/admin/sellers/${menuSeller.id}/`}
              className="rounded-md px-space-3 py-space-3 text-sm font-medium hover:bg-porter-bg-surface"
              onClick={() => setMenuSeller(null)}
            >
              View detail
            </Link>
            <button type="button" className="rounded-md px-space-3 py-space-3 text-left text-sm hover:bg-porter-bg-surface">
              Edit plan (API)
            </button>
            <button type="button" className="rounded-md px-space-3 py-space-3 text-left text-sm hover:bg-porter-bg-surface">
              Deactivate (API)
            </button>
            <Link
              href={`/dashboard/?impersonate=${menuSeller.id}`}
              className="rounded-md px-space-3 py-space-3 text-sm font-semibold text-red-400 hover:bg-porter-bg-surface"
              onClick={() => setMenuSeller(null)}
            >
              Impersonate (opens shop dashboard)
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
}
