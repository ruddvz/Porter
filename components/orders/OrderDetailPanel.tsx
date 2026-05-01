"use client";

import type { OrderWithItems } from "@/lib/orders-ui";
import { formatCurrencyInr, orderStatusBadge, paymentBadge } from "@/lib/orders-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { Order } from "@/types";
import { Copy, GripHorizontal, MapPin, Printer, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function OrderDetailPanel({
  order,
  onClose,
  onSaved,
  onOrderUpdate,
}: {
  order: OrderWithItems | null;
  onClose: () => void;
  onSaved: () => void;
  onOrderUpdate?: (o: Order) => void;
}) {
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const [note, setNote] = useState(order?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    setNote(order?.notes ?? "");
  }, [order?.id, order?.notes]);

  const o = order;
  const statusBadge = useMemo(() => (o ? orderStatusBadge(o.status) : null), [o]);
  const pay = useMemo(() => (o ? paymentBadge(o) : null), [o]);

  const markCodCollected = useCallback(async () => {
    if (!o) return;
    setBusy(true);
    const prev = { ...o };
    const updates = { payment_status: "cod_collected" as const };
    onOrderUpdate?.({ ...o, ...updates });
    const { error } = await supabase.from("orders").update(updates).eq("id", o.id);
    setBusy(false);
    if (error) {
      onOrderUpdate?.(prev);
      toast(error.message, "error");
    } else {
      toast("Cash collected updated", "success");
      onSaved();
    }
  }, [o, onOrderUpdate, onSaved, supabase, toast]);

  const saveNote = useCallback(async () => {
    if (!o) return;
    setBusy(true);
    const { error } = await supabase.from("orders").update({ notes: note }).eq("id", o.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else {
      toast("Notes saved", "success");
      onSaved();
    }
  }, [note, o, supabase, toast, onSaved]);

  const cancelOrder = useCallback(async () => {
    if (!o) return;
    if (o.status !== "pending" && o.status !== "confirmed" && o.status !== "preparing" && o.status !== "paid") return;
    setBusy(true);
    const prev = { ...o };
    const updates = { status: "cancelled" as const };
    onOrderUpdate?.({ ...o, ...updates });
    const { error } = await supabase.from("orders").update(updates).eq("id", o.id);
    setBusy(false);
    if (error) {
      onOrderUpdate?.(prev);
      toast(error.message, "error");
    } else {
      toast("Order cancelled", "success");
      setCancelOpen(false);
      onSaved();
      onClose();
    }
  }, [o, onOrderUpdate, onSaved, onClose, supabase, toast]);

  const printOrder = useCallback(() => {
    if (!o) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const lines =
      o.order_items?.map((i) => `${i.product_name}\t${i.quantity}\t${i.unit}\t₹${i.unit_price}\t₹${i.total_price}`) ?? [];
    w.document.write(`<pre style="font-family:system-ui;padding:16px">${[
      `Order ${o.id.slice(0, 8)}`,
      `${o.customer_name || ""} ${o.customer_phone}`,
      `${o.delivery_area || ""} ${o.delivery_address || ""}`,
      "",
      ...lines,
      "",
      `Total ₹${o.total_amount}`,
    ].join("\n")}</pre>`);
    w.document.close();
    w.print();
    w.close();
  }, [o]);

  if (!o) return null;

  const canCancel =
    o.status === "pending" ||
    o.status === "confirmed" ||
    o.status === "preparing" ||
    o.status === "paid";

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50 lg:bg-black/40" aria-hidden onClick={onClose} />
      <aside
        className="fixed inset-x-0 bottom-0 z-[95] flex max-h-[85vh] flex-col rounded-t-2xl border border-porter-bg-border bg-porter-bg-raised shadow-modal lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[400px] lg:rounded-none lg:border-l lg:border-t-0 animate-porter-modal-sheet lg:animate-porter-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        <div className="flex shrink-0 items-center justify-center pt-2 lg:hidden">
          <GripHorizontal className="h-5 w-5 text-porter-text-muted" aria-hidden />
        </div>
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-porter-bg-border px-4 py-3">
          <div className="min-w-0">
            <p id="order-detail-title" className="text-mono text-porter-text-muted">
              {o.id.slice(0, 8)}
            </p>
            {statusBadge && <Badge className="mt-2" kind="status" variant={statusBadge.variant} label={statusBadge.label} size="sm" />}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-porter-text-secondary hover:bg-porter-bg-surface hover:text-porter-text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <section className="space-y-1">
            <h3 className="text-label text-porter-text-muted">Customer</h3>
            <p className="text-title text-porter-text-primary">{o.customer_name || "—"}</p>
            <a className="text-mono text-porter-green-400 hover:underline" href={`tel:${o.customer_phone}`}>
              {o.customer_phone}
            </a>
            <p className="mt-2 flex items-start gap-2 text-body text-porter-text-secondary">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-porter-text-muted" />
              <span>
                {o.delivery_area || "—"}
                <br />
                {o.delivery_address || "—"}
              </span>
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-label text-porter-text-muted">Items</h3>
            <div className="mt-2 overflow-hidden rounded-lg border border-porter-bg-border">
              <table className="w-full text-left text-body">
                <thead className="bg-porter-bg-surface text-label text-porter-text-muted">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2 text-right">Line</th>
                  </tr>
                </thead>
                <tbody>
                  {o.order_items?.map((i) => (
                    <tr key={i.id} className="border-t border-porter-bg-border">
                      <td className="px-3 py-2 text-porter-text-primary">{i.product_name}</td>
                      <td className="px-3 py-2 text-mono text-porter-text-secondary">
                        {i.quantity} {i.unit}
                      </td>
                      <td className="px-3 py-2 text-right text-mono text-porter-text-primary">₹{i.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-between text-body text-porter-text-secondary">
              <span>Subtotal</span>
              <span className="text-mono text-porter-text-primary">{formatCurrencyInr(o.total_amount)}</span>
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h3 className="text-label text-porter-text-muted">Payment</h3>
            {pay && (
              <div className="flex flex-wrap gap-2">
                <Badge kind="status" variant={pay.statusVariant} label={pay.label} size="sm" />
                <span className="rounded-md border border-porter-bg-border bg-porter-bg-surface px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-porter-text-secondary">
                  {pay.methodLabel}
                </span>
              </div>
            )}
            {o.payment_method === "cod" && (
              <p className="text-body text-porter-text-secondary">
                Cash collected:{" "}
                <span className="font-semibold text-porter-text-primary">
                  {o.payment_status === "cod_collected" ? "Yes" : "No"}
                </span>
              </p>
            )}
            {o.razorpay_payment_link_url && (
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={o.razorpay_payment_link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm font-medium text-porter-green-400 hover:underline"
                >
                  {o.razorpay_payment_link_url}
                </a>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-porter-bg-border px-2 text-sm text-porter-text-secondary hover:bg-porter-bg-surface"
                  onClick={() => {
                    void navigator.clipboard.writeText(o.razorpay_payment_link_url!);
                    toast("Link copied", "success");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            )}
          </section>

          <section className="mt-6">
            <h3 className="text-label text-porter-text-muted">Timeline</h3>
            <ol className="mt-3 space-y-3 border-l border-porter-bg-border pl-4">
              {[
                { key: "recv", label: "Received", done: true, ts: o.created_at },
                {
                  key: "conf",
                  label: "Confirmed",
                  done: ["confirmed", "preparing", "paid", "out_for_delivery", "delivered"].includes(o.status),
                  ts: ["confirmed", "preparing", "paid", "out_for_delivery", "delivered"].includes(o.status) ? o.created_at : null,
                },
                {
                  key: "prep",
                  label: "Preparing",
                  done: ["preparing", "paid", "out_for_delivery", "delivered"].includes(o.status),
                  ts: ["preparing", "paid", "out_for_delivery", "delivered"].includes(o.status) ? o.created_at : null,
                },
                { key: "paid", label: "Paid", done: o.payment_status === "paid", ts: o.paid_at },
                {
                  key: "dispatch",
                  label: "Dispatched",
                  done: o.status === "out_for_delivery" || o.status === "delivered",
                  ts: o.status === "out_for_delivery" || o.status === "delivered" ? o.paid_at ?? o.created_at : null,
                },
                { key: "del", label: "Delivered", done: o.status === "delivered", ts: o.delivered_at },
              ].map((step) => (
                <li key={step.key} className="relative">
                  <span
                    className={`absolute -left-[21px] top-1 flex h-2.5 w-2.5 rounded-full ring-2 ring-porter-bg-raised ${
                      step.done ? "bg-porter-green-500" : "bg-porter-bg-border"
                    }`}
                  />
                  <p className={`text-sm font-semibold ${step.done ? "text-porter-text-primary" : "text-porter-text-muted"}`}>
                    {step.label}
                  </p>
                  <p className="text-mono text-xs text-porter-text-muted">
                    {step.ts ? new Date(step.ts as string).toLocaleString() : "—"}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6">
            <h3 className="text-label text-porter-text-muted">Notes</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => void saveNote()}
              rows={3}
              className="mt-2 w-full rounded-lg border border-porter-bg-border bg-porter-bg-surface px-3 py-2 text-body text-porter-text-primary outline-none focus:border-porter-green-500 focus:ring-2 focus:ring-porter-green-500/20"
            />
          </section>
        </div>

        <footer className="shrink-0 border-t border-porter-bg-border px-4 py-3">
          <div className="flex flex-wrap justify-end gap-2">
            {o.payment_method === "cod" && o.payment_status === "cod_pending" && (
              <Button type="button" variant="primary" size="sm" className="bg-porter-orange-500 hover:bg-porter-orange-600" loading={busy} onClick={() => void markCodCollected()}>
                Mark cash collected
              </Button>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={printOrder}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            {canCancel && (
              <Button type="button" variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                Cancel order
              </Button>
            )}
          </div>
        </footer>
      </aside>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this order?"
        mobileSheet
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setCancelOpen(false)}>
              Back
            </Button>
            <Button type="button" variant="danger" loading={busy} onClick={() => void cancelOrder()}>
              Cancel order
            </Button>
          </>
        }
      >
        <p className="text-body text-porter-text-secondary">This cannot be undone from the customer chat.</p>
      </Modal>
    </>
  );
}
