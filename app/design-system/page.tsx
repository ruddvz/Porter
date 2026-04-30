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
import { LayoutDashboard, Package, ScrollText, Settings } from "lucide-react";
import { useState } from "react";

export default function DesignSystemPage() {
  const { push } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-porter-bg-base pb-24 pt-6 text-porter-text-primary">
      <div className="mx-auto max-w-5xl space-y-10 px-4">
        <header>
          <h1 className="text-display text-porter-green-500">PORTER</h1>
          <p className="mt-2 text-heading">Design system</p>
          <p className="mt-1 text-body text-porter-text-secondary">
            Session 0 — tokens, typography utilities, and base UI components.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-title">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge kind="status" variant="paid" label="Paid" pulse />
            <Badge kind="status" variant="unpaid" label="Unpaid" pulse />
            <Badge kind="status" variant="cod" label="COD" />
            <Badge kind="status" variant="dispatched" label="Out for delivery" pulse />
            <Badge kind="plan" variant="starter" label="Starter" />
            <Badge kind="plan" variant="growth" label="Growth" type="square" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-title">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>Default card</Card>
          <Card variant="raised">Raised card</Card>
          <Card variant="glow" clickable>
            Glow + clickable
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Input.Text id="ds-name" label="Store name" placeholder="e.g. Patel Kirana" />
          <Input.Text id="ds-search" label="Search" inputVariant="search" placeholder="Search orders" />
          <Input.Select id="ds-unit" label="Unit" defaultValue="kg">
            <option value="kg">kg</option>
            <option value="l">litre</option>
          </Input.Select>
          <Input.Textarea id="ds-notes" label="Notes" placeholder="Internal notes" rows={3} />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Today's orders" value={42} />
          <StatCard label="Revenue" value="12,450" prefix="₹" valueTone="success" />
          <StatCard label="Pending" value={3} valueTone="warning" />
          <StatCard label="Loading" value="" loading />
        </section>

        <section className="space-y-4">
          <h2 className="text-title">Table</h2>
          <Table
            columns={[
              { key: "id", header: "ID", sortable: true, cell: (r) => <span className="text-mono text-porter-text-muted">{r.id}</span> },
              { key: "name", header: "Customer", sortable: true, cell: (r) => r.name },
              { key: "total", header: "Total", cell: (r) => <span className="text-mono">{r.total}</span> },
            ]}
            rows={[
              { id: "a1b2c3d4", name: "Riya Shah", total: "₹330" },
              { id: "e5f6g7h8", name: "Aarav Patel", total: "₹120" },
            ]}
            getRowKey={(r) => r.id}
            sortKey="name"
            sortDir="asc"
            onSortChange={() => undefined}
          />
          <Table
            columns={[{ key: "x", header: "X", cell: () => null }]}
            rows={[]}
            getRowKey={() => "empty"}
            emptyTitle="No rows"
            emptyDescription="Empty state inside the table shell."
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-title">Modal</h2>
          <Button type="button" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example modal"
            footer={
              <>
                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setModalOpen(false)}>
                  Save
                </Button>
              </>
            }
          >
            <p className="text-body">Overlay click and Escape close this dialog. Focus is trapped inside.</p>
          </Modal>
        </section>

        <section className="space-y-4">
          <h2 className="text-title">Toasts</h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => push("Saved successfully", "success")}>
              Success
            </Button>
            <Button type="button" variant="secondary" onClick={() => push("Something went wrong", "error")}>
              Error
            </Button>
            <Button type="button" variant="secondary" onClick={() => push("Heads up — inventory low", "warning")}>
              Warning
            </Button>
            <Button type="button" variant="secondary" onClick={() => push("New message from Porter", "info")}>
              Info
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-title">Order card</h2>
          <div className="max-w-md">
            <OrderCard
              customerName="Meera Joshi"
              phone="+91 98765 43210"
              itemsSummary="Potato 5kg, Sunflower oil 2L +2 more"
              totalFormatted="₹330"
              statusLabel="Pending"
              statusVariant="unpaid"
              payment={{ label: "Unpaid", statusVariant: "unpaid", methodLabel: "Online" }}
              timeLabel="18 mins ago"
              timeUrgency="warn"
              isNew
              onCardClick={() => push("Card opened", "info")}
              actions={
                <>
                  <Button size="sm">Confirm</Button>
                  <Button size="sm" variant="ghost">
                    Cancel
                  </Button>
                </>
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-title">Empty state + skeleton</h2>
          <Card>
            <EmptyState title="No products yet" description="Add your first product to start taking orders." />
          </Card>
          <div className="space-y-2">
            <Skeleton variant="text" width="3/4" />
            <Skeleton variant="text" width="1/2" />
            <Skeleton variant="card" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-title">Sidebar (mobile drawer)</h2>
          <Button type="button" variant="secondary" className="lg:hidden" onClick={() => setMobileNav(true)}>
            Open drawer
          </Button>
          <Sidebar
            subtitle="Demo Store"
            userName="Demo Owner"
            mobileOpen={mobileNav}
            onMobileOpenChange={setMobileNav}
            items={[
              { href: "/design-system", label: "Live Orders", icon: LayoutDashboard, badge: 2 },
              { href: "#", label: "History", icon: ScrollText },
              { href: "#", label: "Inventory", icon: Package },
              { href: "#", label: "Settings", icon: Settings },
            ]}
            onLogout={() => push("Logged out (demo)", "info")}
          />
          <p className="text-body text-porter-text-muted text-sm">
            On large screens the fixed sidebar sits to the left; on small screens use the button to open the drawer.
          </p>
        </section>
      </div>
    </div>
  );
}
