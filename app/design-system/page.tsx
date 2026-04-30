"use client";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  OrderCard,
  Sidebar,
  Skeleton,
  StatCard,
  Table,
  useToast,
} from "@/components/ui";
import type { TableColumn } from "@/components/ui";
import {
  Home,
  Package,
  Settings,
  ShoppingCart,
  Warehouse,
} from "lucide-react";
import { useState } from "react";

type DemoRow = { id: string; name: string; total: string };

const demoRows: DemoRow[] = [
  { id: "1", name: "Asha Patel", total: "₹330" },
  { id: "2", name: "Ravi Shah", total: "₹120" },
];

const columns: TableColumn<DemoRow>[] = [
  { id: "name", header: "Customer", sortable: true, cell: (r) => r.name },
  { id: "total", header: "Total", sortable: true, cell: (r) => r.total },
];

export default function DesignSystemPage() {
  const { push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = [...demoRows].sort((a, b) => {
    const av = sortKey === "total" ? a.total : a.name;
    const bv = sortKey === "total" ? b.total : b.name;
    const cmp = av.localeCompare(bv);
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="min-h-screen bg-porter-bg-base pb-space-12 pt-space-20 px-space-4 sm:px-space-8">
      <div className="mx-auto max-w-6xl space-y-space-10">
        <header className="space-y-space-2">
          <p className="text-label text-porter-orange-500">Session 0</p>
          <h1 className="text-display text-porter-text-primary">PORTER UI</h1>
          <p className="text-body text-porter-text-secondary max-w-2xl">
            Design system preview — tokens, typography, and base components.
          </p>
        </header>

        <section className="space-y-space-4">
          <h2 className="text-heading">Typography</h2>
          <Card padding="lg" className="space-y-space-4">
            <p className="text-display text-porter-green-400">₹12,450</p>
            <p className="text-heading">Page title sample</p>
            <p className="text-title">Card title sample</p>
            <p className="text-body">
              Body copy for descriptions and helper text in DM Sans.
            </p>
            <p className="text-label text-porter-text-muted">Column header</p>
            <p className="text-mono text-porter-text-secondary">ORD-7f3a9b2c · +91 98765 43210</p>
          </Card>
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Buttons & badges</h2>
          <Card padding="lg" className="flex flex-wrap gap-space-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Badge variant="status" status="paid" label="Paid" live />
            <Badge variant="status" status="unpaid" label="Unpaid" live />
            <Badge variant="plan" plan="growth" label="Growth" />
          </Card>
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Cards & inputs</h2>
          <div className="grid gap-space-4 md:grid-cols-2">
            <Card variant="raised" padding="md">
              Raised card
            </Card>
            <Card variant="glow" padding="md" clickable>
              Glow hover (clickable)
            </Card>
          </div>
          <div className="grid gap-space-4 md:grid-cols-2">
            <Input label="Store name" variant="text" placeholder="e.g. Krishna General" />
            <Input label="Amount" variant="number" placeholder="0" />
            <Input
              label="Notes"
              variant="textarea"
              rows={3}
              placeholder="Internal notes"
            />
            <Input
              label="Unit"
              variant="select"
              options={[
                { value: "kg", label: "kg" },
                { value: "piece", label: "piece" },
              ]}
              placeholderOption="Select unit"
            />
          </div>
          <Input label="Search" variant="search" placeholder="Search orders" error="Example error" />
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Stat cards & skeleton</h2>
          <div className="grid gap-space-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Today orders" value={42} />
            <StatCard label="Revenue" value="12,450" prefix="₹" highlight="green" />
            <StatCard label="Pending" value={3} highlight="orange" />
            <StatCard label="Loading" value="—" loading />
          </div>
          <Skeleton variant="table-row" />
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Table</h2>
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
          />
          <Table
            columns={columns}
            data={[]}
            getRowKey={(r) => r.id}
            emptyTitle="No rows"
            emptyDescription="Add data to see the table."
          />
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Order card</h2>
          <div className="max-w-md">
            <OrderCard
              customerName="Meera Joshi"
              phone="+91 98250 11223"
              itemsPreview="Potato 5kg, Butter 200g"
              itemCount={4}
              totalRupee={330}
              orderStatusVariant="dispatched"
              orderStatusLabel="Out for delivery"
              paymentStatusVariant="paid"
              paymentStatusLabel="Online · Paid"
              relativeTime="18 mins ago"
              pendingMinutes={20}
              actions={
                <>
                  <Button size="sm" variant="primary">
                    Delivered
                  </Button>
                </>
              }
            />
          </div>
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Empty state</h2>
          <Card padding="none">
            <EmptyState
              title="No orders yet"
              description="When customers order on WhatsApp, they appear here."
              actionLabel="Refresh"
              onAction={() => push("info", "Refreshed (demo)")}
              icon={<ShoppingCart className="h-8 w-8" />}
            />
          </Card>
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Modal & toast</h2>
          <div className="flex flex-wrap gap-space-3">
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="secondary" onClick={() => push("success", "Saved successfully")}>
              Toast success
            </Button>
            <Button variant="secondary" onClick={() => push("error", "Something went wrong")}>
              Toast error
            </Button>
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example modal"
            footer={
              <div className="flex w-full flex-wrap justify-end gap-space-3">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>Confirm</Button>
              </div>
            }
          >
            <p className="text-body text-porter-text-secondary">
              Focus is trapped inside the dialog. Press Escape or click the backdrop to close.
            </p>
          </Modal>
        </section>

        <section className="space-y-space-4">
          <h2 className="text-heading">Sidebar (desktop + mobile menu)</h2>
          <p className="text-body text-porter-text-secondary">
            Use the menu button (top-left on small screens) to open the drawer.
          </p>
          <div className="flex h-[420px] overflow-hidden rounded-xl border border-porter-bg-border bg-porter-bg-surface">
            <Sidebar
              brand={<span className="font-display text-xl tracking-wide text-porter-green-500">PORTER</span>}
              items={[
                {
                  href: "#",
                  label: "Live orders",
                  icon: <Home className="h-5 w-5" />,
                  active: true,
                },
                {
                  href: "#",
                  label: "Orders",
                  icon: <ShoppingCart className="h-5 w-5" />,
                },
                {
                  href: "#",
                  label: "Inventory",
                  icon: <Warehouse className="h-5 w-5" />,
                  badge: (
                    <span className="rounded-full bg-porter-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-porter-orange-500">
                      3
                    </span>
                  ),
                },
                {
                  href: "#",
                  label: "Settings",
                  icon: <Settings className="h-5 w-5" />,
                },
              ]}
              userName="Demo Seller"
              onLogout={() => push("warning", "Logged out (demo)")}
            />
            <div className="hidden flex-1 flex-col border-l border-porter-bg-border p-space-6 lg:flex">
              <div className="flex items-center gap-space-2 text-porter-text-muted">
                <Package className="h-5 w-5" />
                <span className="text-body">Main content area</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
