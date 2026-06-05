"use client";

import type { ReactNode } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import type { FulfillmentType, PublicStore, StorefrontPaymentMethod } from "@/components/storefront/types";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full min-h-12 rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-surface px-3 text-base text-porter-text-primary outline-none focus:border-porter-green-500 focus:ring-2 focus:ring-porter-green-500/20";

export function CheckoutSheet({
  open,
  onClose,
  store,
  subtotal,
  deliveryFee,
  name,
  phone,
  fulfillment,
  deliveryArea,
  address,
  paymentMethod,
  notes,
  error,
  busy,
  onNameChange,
  onPhoneChange,
  onFulfillmentChange,
  onDeliveryAreaChange,
  onAddressChange,
  onPaymentChange,
  onNotesChange,
  onPlaceOrder,
}: {
  open: boolean;
  onClose: () => void;
  store: PublicStore;
  subtotal: number;
  deliveryFee: number;
  name: string;
  phone: string;
  fulfillment: FulfillmentType;
  deliveryArea: string;
  address: string;
  paymentMethod: StorefrontPaymentMethod;
  notes: string;
  error: string | null;
  busy: boolean;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onFulfillmentChange: (v: FulfillmentType) => void;
  onDeliveryAreaChange: (v: string) => void;
  onAddressChange: (v: string) => void;
  onPaymentChange: (v: StorefrontPaymentMethod) => void;
  onNotesChange: (v: string) => void;
  onPlaceOrder: () => void;
}) {
  const total = subtotal + (fulfillment === "delivery" ? deliveryFee : 0);
  const zones = store.delivery_zones ?? [];
  const canPickup = store.pickup_enabled !== false;
  const canDeliver = store.delivery_enabled !== false;
  const paymentOptions: { id: StorefrontPaymentMethod; label: string }[] = [];
  if (store.cod_enabled) paymentOptions.push({ id: "cod", label: "Cash on delivery" });
  paymentOptions.push({ id: "razorpay", label: "Pay online" });

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Checkout"
      footer={
        <Button type="button" className="w-full" size="lg" loading={busy} onClick={onPlaceOrder}>
          Place order · ₹{Math.round(total).toLocaleString("en-IN")}
        </Button>
      }
    >
      <div className="space-y-4">
        {(canPickup && canDeliver) || (!canPickup && canDeliver) || (canPickup && !canDeliver) ? (
          <div>
            <p className="text-[13px] font-semibold text-porter-text-primary">Pickup or delivery</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {canPickup ? (
                <Chip active={fulfillment === "pickup"} onClick={() => onFulfillmentChange("pickup")}>
                  Pickup
                </Chip>
              ) : null}
              {canDeliver ? (
                <Chip active={fulfillment === "delivery"} onClick={() => onFulfillmentChange("delivery")}>
                  Delivery
                </Chip>
              ) : null}
            </div>
          </div>
        ) : null}

        <Field label="Your name" htmlFor="sf-name">
          <input
            id="sf-name"
            className={fieldClass}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Phone" htmlFor="sf-phone" helper="We will share order updates on this number.">
          <input
            id="sf-phone"
            className={fieldClass}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </Field>

        {fulfillment === "delivery" ? (
          <>
            {zones.length > 0 ? (
              <Field label="Area" htmlFor="sf-area">
                <select
                  id="sf-area"
                  className={fieldClass}
                  value={deliveryArea}
                  onChange={(e) => onDeliveryAreaChange(e.target.value)}
                >
                  <option value="">Select area</option>
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="Area / locality" htmlFor="sf-area-text">
                <input
                  id="sf-area-text"
                  className={fieldClass}
                  value={deliveryArea}
                  onChange={(e) => onDeliveryAreaChange(e.target.value)}
                  autoComplete="address-level3"
                />
              </Field>
            )}
            <Field label="Delivery address" htmlFor="sf-address">
              <textarea
                id="sf-address"
                className={`${fieldClass} min-h-[88px] resize-y`}
                value={address}
                onChange={(e) => onAddressChange(e.target.value)}
                autoComplete="street-address"
                rows={3}
              />
            </Field>
          </>
        ) : null}

        <div>
          <p className="text-[13px] font-semibold text-porter-text-primary">Payment</p>
          <div className="mt-2 flex flex-col gap-2">
            {paymentOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPaymentChange(opt.id)}
                className={cn(
                  "min-h-12 rounded-[var(--po-radius-md)] border px-4 text-left text-sm font-semibold",
                  paymentMethod === opt.id
                    ? "border-porter-green-500 bg-[var(--po-primary-soft)] text-porter-green-600"
                    : "border-porter-bg-border text-porter-text-secondary",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="Order note (optional)" htmlFor="sf-notes">
          <textarea
            id="sf-notes"
            className={`${fieldClass} min-h-[72px] resize-y`}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
          />
        </Field>

        <div className="rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-raised p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-porter-text-muted">Subtotal</span>
            <span className="tabular-nums font-semibold">₹{Math.round(subtotal).toLocaleString("en-IN")}</span>
          </div>
          {fulfillment === "delivery" && deliveryFee > 0 ? (
            <div className="mt-1 flex justify-between">
              <span className="text-porter-text-muted">Delivery</span>
              <span className="tabular-nums font-semibold">₹{Math.round(deliveryFee).toLocaleString("en-IN")}</span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between border-t border-porter-bg-border pt-2 font-bold">
            <span>Total</span>
            <span className="tabular-nums">₹{Math.round(total).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-porter-orange-500" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-[var(--po-radius-pill)] border px-4 text-sm font-semibold",
        active
          ? "border-porter-green-500 bg-[var(--po-primary-soft)] text-porter-green-600"
          : "border-porter-bg-border text-porter-text-secondary",
      )}
    >
      {children}
    </button>
  );
}
