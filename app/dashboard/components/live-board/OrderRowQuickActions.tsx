"use client";

import { Button } from "@/components/ui/Button";
import type { OrderWithItems } from "@/lib/orders-ui";
import type { Order } from "@/types";
import { Check, MessageCircle, Package, Truck, X } from "lucide-react";
import type { MouseEvent } from "react";
import { isAwaitingPayment, waLink } from "./types";

function stopRowClick(fn: () => void) {
  return (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };
}

export default function OrderRowQuickActions({
  order,
  onPatch,
}: {
  order: OrderWithItems;
  onPatch: (u: Partial<Order>) => void;
}) {
  const prefill = `Hi${order.customer_name ? ` ${order.customer_name}` : ""}, regarding order #${order.id.slice(0, 8)} — `;

  return (
    <>
      <Button
        size="sm"
        type="button"
        variant="secondary"
        aria-label="Open WhatsApp chat"
        onClick={stopRowClick(() => window.open(waLink(order.customer_phone, prefill), "_blank", "noopener,noreferrer"))}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        WhatsApp
      </Button>
      {order.status === "pending" && (
        <>
          <Button size="sm" type="button" onClick={stopRowClick(() => onPatch({ status: "confirmed" }))}>
            <Check className="h-4 w-4" aria-hidden />
            Confirm
          </Button>
          <Button
            size="sm"
            type="button"
            variant="ghost"
            className="text-porter-status-cancelled hover:text-porter-status-cancelled"
            onClick={stopRowClick(() => onPatch({ status: "cancelled" }))}
          >
            <X className="h-4 w-4" aria-hidden />
            Cancel
          </Button>
          {isAwaitingPayment(order) && (
            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={stopRowClick(() => onPatch({ payment_status: "paid", status: "preparing" }))}
            >
              Mark paid
            </Button>
          )}
        </>
      )}
      {(order.status === "confirmed" || order.status === "paid") && (
        <Button size="sm" type="button" onClick={stopRowClick(() => onPatch({ status: "preparing" }))}>
          <Package className="h-4 w-4" aria-hidden />
          In progress
        </Button>
      )}
      {(order.status === "preparing" || order.status === "paid") && (
        <Button size="sm" type="button" onClick={stopRowClick(() => onPatch({ status: "out_for_delivery" }))}>
          <Truck className="h-4 w-4" aria-hidden />
          Dispatch
        </Button>
      )}
      {order.status === "out_for_delivery" && (
        <Button
          size="sm"
          type="button"
          onClick={stopRowClick(() => onPatch({ status: "delivered", delivered_at: new Date().toISOString() }))}
        >
          <Check className="h-4 w-4" aria-hidden />
          Delivered
        </Button>
      )}
      {order.payment_method === "cod" && order.payment_status === "cod_pending" && (
        <Button
          size="sm"
          type="button"
          className="bg-porter-orange-500 hover:bg-porter-orange-600"
          onClick={stopRowClick(() => onPatch({ payment_status: "cod_collected" }))}
        >
          Mark cash collected
        </Button>
      )}
    </>
  );
}
