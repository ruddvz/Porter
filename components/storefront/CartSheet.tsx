"use client";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import type { StorefrontCartLine } from "@/lib/storefront-cart";
import { Minus, Plus } from "lucide-react";

export function CartSheet({
  open,
  onClose,
  lines,
  subtotal,
  deliveryFee,
  onSetQty,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  lines: StorefrontCartLine[];
  subtotal: number;
  deliveryFee: number;
  onSetQty: (productId: string, qty: number) => void;
  onCheckout: () => void;
}) {
  const total = subtotal + deliveryFee;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Your cart"
      footer={
        <Button type="button" className="w-full" size="lg" disabled={lines.length === 0} onClick={onCheckout}>
          Checkout · ₹{Math.round(total).toLocaleString("en-IN")}
        </Button>
      }
    >
      {lines.length === 0 ? (
        <p className="py-6 text-center text-sm text-porter-text-muted">Your cart is empty.</p>
      ) : (
        <ul className="space-y-3">
          {lines.map((l) => (
            <li
              key={l.productId}
              className="flex items-center justify-between gap-3 rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-porter-text-primary">{l.name}</p>
                <p className="text-sm text-porter-text-muted">
                  ₹{Math.round(l.price).toLocaleString("en-IN")} · {l.unit}
                </p>
              </div>
              <div className="flex shrink-0 items-center rounded-[var(--po-radius-pill)] border border-porter-bg-border">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center"
                  aria-label={`Decrease ${l.name}`}
                  onClick={() => onSetQty(l.productId, l.qty - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-bold">{l.qty}</span>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center"
                  aria-label={`Increase ${l.name}`}
                  onClick={() => onSetQty(l.productId, l.qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 space-y-2 border-t border-porter-bg-border pt-4 text-sm">
        <div className="flex justify-between text-porter-text-secondary">
          <span>Subtotal</span>
          <span className="tabular-nums font-semibold text-porter-text-primary">
            ₹{Math.round(subtotal).toLocaleString("en-IN")}
          </span>
        </div>
        {deliveryFee > 0 ? (
          <div className="flex justify-between text-porter-text-secondary">
            <span>Delivery fee</span>
            <span className="tabular-nums font-semibold text-porter-text-primary">
              ₹{Math.round(deliveryFee).toLocaleString("en-IN")}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between text-base font-bold text-porter-text-primary">
          <span>Total</span>
          <span className="tabular-nums">₹{Math.round(total).toLocaleString("en-IN")}</span>
        </div>
      </div>
    </BottomSheet>
  );
}
