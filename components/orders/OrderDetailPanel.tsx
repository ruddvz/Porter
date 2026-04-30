"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { MockOrder } from "@/lib/dashboard-mock";
import { orderSubtotal } from "@/lib/dashboard-mock";
import { Copy, MapPin, Printer, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type OrderDetailPanelProps = {
  order: MockOrder | null;
  open: boolean;
  onClose: () => void;
};

export function OrderDetailPanel({ order, open, onClose }: OrderDetailPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState("");
  const prevFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (order) setNote(order.note);
  }, [order]);

  useEffect(() => {
    if (!open) return;
    prevFocused.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prevFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !order) return null;

  const subtotal = orderSubtotal(order);
  const shortId = order.id.slice(0, 8);

  const handlePrint = () => {
    window.print();
  };

  const copyLink = async () => {
    if (!order.razorpayUrl) return;
    try {
      await navigator.clipboard.writeText(order.razorpayUrl);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 print:hidden"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative flex h-[85dvh] w-full max-h-[85vh] flex-col border-t border-porter-bg-border bg-porter-bg-raised shadow-modal print:static print:h-auto print:max-h-none print:w-full print:border-0 print:shadow-none",
          "animate-[modal-up_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards] lg:h-full lg:max-h-none lg:w-[400px] lg:max-w-[100vw] lg:border-l lg:border-t-0 lg:animate-[modal-fade_0.25s_ease-out_forwards]"
        )}
      >
        <div className="mx-auto mt-space-2 h-1 w-10 shrink-0 rounded-full bg-porter-bg-border lg:hidden print:hidden" />

        <div className="flex items-start justify-between gap-space-3 border-b border-porter-bg-border px-space-4 py-space-3 print:hidden">
          <div className="min-w-0">
            <p className="text-mono text-porter-text-muted">#{shortId}</p>
            <div className="mt-space-1">
              <Badge variant="status" status={order.orderStatusVariant} label={order.orderStatusLabel} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-porter-text-secondary hover:bg-porter-bg-surface"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id="print-order" className="min-h-0 flex-1 overflow-y-auto px-space-4 py-space-4">
          <h2 id={titleId} className="sr-only">
            Order detail
          </h2>

          <section className="space-y-space-2 border-b border-porter-bg-border pb-space-4">
            <p className="text-title text-porter-text-primary">{order.customerName}</p>
            <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="text-mono text-porter-green-400 hover:underline">
              {order.phone}
            </a>
            <p className="flex items-start gap-space-2 text-body text-porter-text-secondary">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-porter-text-muted" aria-hidden />
              <span>
                {order.area} — {order.address}
              </span>
            </p>
          </section>

          <section className="py-space-4">
            <p className="text-label text-porter-text-muted">Items</p>
            <div className="mt-space-2 overflow-hidden rounded-lg border border-porter-bg-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-porter-bg-surface text-label text-porter-text-muted">
                  <tr>
                    <th className="px-space-3 py-space-2">Item</th>
                    <th className="px-space-3 py-space-2 text-right">Qty</th>
                    <th className="px-space-3 py-space-2 text-right">Price</th>
                    <th className="px-space-3 py-space-2 text-right">Line</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.name} className="border-t border-porter-bg-border">
                      <td className="px-space-3 py-space-2 text-porter-text-primary">{it.name}</td>
                      <td className="px-space-3 py-space-2 text-right text-mono text-porter-text-secondary">
                        {it.qty}
                      </td>
                      <td className="px-space-3 py-space-2 text-right text-mono text-porter-text-secondary">
                        ₹{it.unitPrice}
                      </td>
                      <td className="px-space-3 py-space-2 text-right text-mono font-semibold text-porter-text-primary">
                        ₹{(it.qty * it.unitPrice).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-porter-bg-border bg-porter-bg-surface">
                  <tr>
                    <td colSpan={3} className="px-space-3 py-space-2 text-porter-text-secondary">
                      Subtotal
                    </td>
                    <td className="px-space-3 py-space-2 text-right text-mono">₹{subtotal.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-space-3 py-space-2 pb-space-3 font-semibold text-porter-text-primary">
                      Total
                    </td>
                    <td className="px-space-3 pb-space-3 text-right text-display text-porter-green-400">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="space-y-space-2 border-b border-porter-bg-border pb-space-4">
            <p className="text-label text-porter-text-muted">Payment</p>
            <div className="flex flex-wrap gap-space-2">
              <Badge variant="status" status={order.paymentStatusVariant} label={order.paymentLabel} />
            </div>
            {order.razorpayUrl && (
              <div className="flex flex-wrap items-center gap-space-2">
                <span className="truncate text-mono text-xs text-porter-text-muted">{order.razorpayUrl}</span>
                <Button type="button" variant="secondary" size="sm" onClick={copyLink}>
                  <Copy className="h-4 w-4" aria-hidden />
                  Copy
                </Button>
              </div>
            )}
            {!order.paymentOnline && (
              <p className="text-body text-porter-text-secondary">
                Cash collected:{" "}
                <span className="font-semibold text-porter-text-primary">
                  {order.codCollected ? "Yes" : "No"}
                </span>
                {!order.codCollected && (
                  <Button type="button" variant="primary" size="sm" className="ml-space-3 bg-porter-orange-500 hover:bg-porter-orange-600">
                    Mark collected
                  </Button>
                )}
              </p>
            )}
          </section>

          <section className="py-space-4">
            <p className="text-label text-porter-text-muted">Timeline</p>
            <ol className="relative mt-space-3 space-y-space-4 border-l border-porter-bg-border pl-space-4">
              {order.timeline.map((step, i) => {
                const done = step.at !== null;
                const firstPending = order.timeline.findIndex((s) => s.at === null);
                const activeIndex = firstPending === -1 ? order.timeline.length - 1 : firstPending;
                const active = i === activeIndex;
                return (
                  <li key={step.key} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[21px] top-1 flex h-3 w-3 rounded-full border-2",
                        active
                          ? "border-porter-green-500 bg-porter-green-500 ring-2 ring-porter-green-500/30"
                          : done
                            ? "border-porter-green-700 bg-porter-green-900"
                            : "border-porter-bg-border bg-porter-bg-surface"
                      )}
                    />
                    <p className="text-sm font-semibold text-porter-text-primary">{step.label}</p>
                    <p className="text-mono text-xs text-porter-text-muted">{step.at ?? "—"}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="pb-space-4">
            <label htmlFor="order-notes" className="text-label text-porter-text-muted">
              Notes
            </label>
            <textarea
              id="order-notes"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-space-2 w-full rounded-md border border-porter-bg-border bg-porter-bg-surface px-space-3 py-space-2 text-body text-porter-text-primary focus:border-porter-green-500 focus:outline-none focus:ring-2 focus:ring-porter-green-500/25"
              placeholder="Internal notes (saved on blur in production)"
            />
          </section>
        </div>

        <div className="mt-auto flex flex-wrap gap-space-2 border-t border-porter-bg-border px-space-4 py-space-4 print:hidden">
          <Button type="button" variant="secondary" size="md" onClick={handlePrint}>
            <Printer className="h-4 w-4" aria-hidden />
            Print order
          </Button>
          {(order.column === "pending" || order.column === "confirmed") && (
            <Button type="button" variant="danger" size="md">
              Cancel order
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
