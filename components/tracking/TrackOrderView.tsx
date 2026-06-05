import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { HeroCard } from "@/components/ui/HeroCard";
import { Card } from "@/components/ui/Card";
export type TrackOrderData = {
  order_id: string;
  status: string;
  payment_status: string | null;
  total_amount: number | null;
  created_at: string;
  delivery_area: string | null;
  store_name: string;
  city: string | null;
  scheduled_for: string | null;
  rider_label: string | null;
};

const heroCopy: Record<string, { title: string; description: string }> = {
  pending: {
    title: "Order received",
    description: "The store is reviewing your order.",
  },
  confirmed: {
    title: "Order confirmed",
    description: "The store has accepted your order.",
  },
  preparing: {
    title: "Preparing your order",
    description: "The store has started packing your items.",
  },
  ready: {
    title: "Ready for pickup or delivery",
    description: "Your order is packed and waiting.",
  },
  out_for_delivery: {
    title: "Out for delivery",
    description: "Your order is on the way.",
  },
  delivered: {
    title: "Delivered",
    description: "Thanks for ordering.",
  },
  cancelled: {
    title: "Order cancelled",
    description: "Contact the store if you need help.",
  },
};

function timelineSteps(status: string) {
  const order = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];
  const idx = order.indexOf(status);
  return [
    { key: "received", label: "Received", done: idx >= 0 || status === "cancelled" },
    { key: "confirmed", label: "Confirmed", done: idx >= 1 },
    { key: "preparing", label: "Preparing", done: idx >= 2 },
    { key: "ready", label: "Ready", done: idx >= 3 },
    { key: "delivery", label: "Out for delivery", done: idx >= 4 },
    { key: "done", label: "Delivered", done: status === "delivered" },
  ];
}

export function TrackOrderView({ row }: { row: TrackOrderData }) {
  const hero = heroCopy[row.status] ?? {
    title: row.status.replace(/_/g, " "),
    description: "We will update this page when the status changes.",
  };
  const steps = timelineSteps(row.status);
  const shortId = String(row.order_id).slice(0, 8).toUpperCase();
  const amount = Math.round(Number(row.total_amount ?? 0)).toLocaleString("en-IN");
  return (
    <main id="main-content" className="min-h-screen bg-porter-bg-base px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div className="mx-auto max-w-md space-y-5">
        <header className="text-center">
          <p className="text-sm font-semibold text-porter-green-600">{row.store_name}</p>
          <p className="text-xs text-porter-text-muted">{row.city ?? "India"}</p>
        </header>

        <HeroCard title={hero.title} description={hero.description} variant="green">
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={row.status} />
            {row.payment_status ? <PaymentBadge status={row.payment_status} /> : null}
          </div>
        </HeroCard>

        <Card padding="lg" className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-porter-text-muted">Order</p>
              <p className="font-mono text-lg font-bold text-porter-text-primary">{shortId}</p>
            </div>
            <p className="text-xl font-bold tabular-nums text-porter-text-primary">₹{amount}</p>
          </div>
          <p className="text-sm text-porter-text-muted">
            Placed {new Date(row.created_at).toLocaleString()}
            {row.delivery_area ? ` · ${row.delivery_area}` : ""}
          </p>
          {row.scheduled_for ? (
            <p className="text-sm text-porter-orange-500">Scheduled: {new Date(row.scheduled_for).toLocaleString()}</p>
          ) : null}
          {row.rider_label ? <p className="text-sm text-porter-text-secondary">Rider: {row.rider_label}</p> : null}
        </Card>

        <Card padding="lg">
          <h2 className="text-sm font-semibold text-porter-text-primary">Order timeline</h2>
          <ol className="mt-4 space-y-4 border-l-2 border-porter-green-500/30 pl-5">
            {steps.map((s) => (
              <li key={s.key} className="relative">
                <span
                  className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full ring-2 ring-porter-bg-base ${
                    s.done ? "bg-porter-green-600" : "bg-porter-bg-border"
                  }`}
                  aria-hidden
                />
                <p className={`text-sm font-medium ${s.done ? "text-porter-text-primary" : "text-porter-text-muted"}`}>
                  {s.label}
                </p>
              </li>
            ))}
          </ol>
        </Card>

        <p className="text-center text-xs text-porter-text-muted">
          This page shows order status only. For changes, message the store.
        </p>
      </div>
    </main>
  );
}
