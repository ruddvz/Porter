"use client";

import type { OrderWithItems } from "@/components/orders/OrderCard";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useState } from "react";

/** Slide-over panel with full order breakdown and manual actions. */
export default function OrderDetailPanel({
  order,
  onClose,
  onSaved,
}: {
  order: OrderWithItems | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createSupabaseBrowserClient();
  const [note, setNote] = useState(order?.notes ?? "");
  const [busy, setBusy] = useState(false);

  if (!order) return null;

  const o = order;

  async function markPaid() {
    setBusy(true);
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        status: "confirmed",
      })
      .eq("id", o.id);
    setBusy(false);
    if (error) alert(error.message);
    else onSaved();
  }

  async function saveNote() {
    setBusy(true);
    const { error } = await supabase.from("orders").update({ notes: note }).eq("id", o.id);
    setBusy(false);
    if (error) alert(error.message);
    else onSaved();
  }

  function shareText() {
    const lines =
      o.order_items?.map((i) => `${i.product_name} ${i.quantity} ${i.unit} @ ₹${i.unit_price}`) ?? [];
    const t = `Order ${o.id.slice(0, 8)}\n${lines.join("\n")}\nTotal ₹${o.total_amount}`;
    void navigator.clipboard.writeText(t);
    alert("Copied to clipboard");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 md:items-stretch" onClick={onClose}>
      <div
        className="h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-[#111A14] p-5 md:h-full md:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-white">Order</h2>
          <button type="button" className="text-white/60" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-white/40">{o.id}</p>

        <section className="mt-6 space-y-2 text-sm">
          <h3 className="text-xs uppercase tracking-wide text-white/50">Customer</h3>
          <p className="text-white">{o.customer_name || "—"}</p>
          <a className="text-[#25D366]" href={`tel:${o.customer_phone}`}>
            {o.customer_phone}
          </a>
          <p className="text-white/70">{o.delivery_area}</p>
          <p className="text-white/70">{o.delivery_address}</p>
        </section>

        <section className="mt-6">
          <h3 className="text-xs uppercase tracking-wide text-white/50">Items</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {o.order_items?.map((i) => (
              <li key={i.id} className="flex justify-between border-b border-white/5 py-2">
                <span className="text-white">
                  {i.product_name} × {i.quantity} {i.unit}
                </span>
                <span className="text-white/80">₹{i.total_price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right font-semibold text-white">Total ₹{o.total_amount}</p>
        </section>

        <section className="mt-6 text-sm">
          <h3 className="text-xs uppercase tracking-wide text-white/50">Payment</h3>
          <p className="mt-1 text-white/80">
            {o.payment_method} · {o.payment_status}
          </p>
          {o.razorpay_payment_link_url && (
            <a href={o.razorpay_payment_link_url} className="mt-2 block truncate text-[#25D366] underline" target="_blank" rel="noreferrer">
              Payment link
            </a>
          )}
        </section>

        <section className="mt-6 text-xs text-white/50">
          <p>Created: {new Date(o.created_at).toLocaleString()}</p>
          {o.paid_at && <p>Paid: {new Date(o.paid_at).toLocaleString()}</p>}
          {o.delivered_at && <p>Delivered: {new Date(o.delivered_at).toLocaleString()}</p>}
        </section>

        <div className="mt-6 space-y-3">
          {o.payment_status === "unpaid" && o.payment_method === "razorpay" && (
            <button
              type="button"
              disabled={busy}
              onClick={markPaid}
              className="w-full rounded-lg bg-[#25D366] py-2 text-sm font-semibold text-black"
            >
              Mark paid (manual)
            </button>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note…"
            className="w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm text-white"
            rows={3}
          />
          <button
            type="button"
            disabled={busy}
            onClick={saveNote}
            className="w-full rounded-lg border border-white/20 py-2 text-sm text-white"
          >
            Save note
          </button>
          <button type="button" onClick={shareText} className="w-full rounded-lg border border-white/20 py-2 text-sm text-white">
            Copy order summary
          </button>
        </div>
      </div>
    </div>
  );
}
