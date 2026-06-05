"use client";

import { useToast } from "@/components/ui/Toast";
import { validateOrderPatch } from "@/lib/order-patch";
import type { OrderWithItems } from "@/lib/orders-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Order } from "@/types";
import { useCallback } from "react";

export function useOrderMutations(
  setOrders: React.Dispatch<React.SetStateAction<OrderWithItems[]>>,
) {
  const { push: toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const updateOrder = useCallback(
    (o: Order) => {
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, ...o } : x)));
    },
    [setOrders],
  );

  const patchOrder = useCallback(
    async (order: OrderWithItems, updates: Partial<Order>) => {
      const check = validateOrderPatch(order, updates);
      if (!check.ok) {
        toast(check.message, "error");
        return;
      }
      const prev = { ...order };
      updateOrder({ ...order, ...updates });

      if (updates.status && updates.status !== prev.status) {
        const res = await fetch(`/api/seller/orders/${order.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const json = (await res.json()) as { error?: { message?: string } };
        if (!res.ok) {
          updateOrder(prev);
          toast(json.error?.message ?? "Status update failed", "error");
          return;
        }
        if (updates.payment_status === "paid" && prev.payment_status !== "paid" && order.seller_id) {
          await supabase.from("order_events").insert({
            order_id: order.id,
            seller_id: order.seller_id,
            event_type: "payment_confirmed_dashboard",
            status: updates.status ?? prev.status,
            payment_status: "paid",
            source: "dashboard",
          });
        }
        return;
      }

      const { error } = await supabase.from("orders").update(updates).eq("id", order.id);
      if (error) {
        updateOrder(prev);
        toast(error.message, "error");
        return;
      }
      if (updates.status && updates.status !== prev.status) {
        try {
          await fetch(`/api/seller/orders/${order.id}/inventory-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ previousStatus: prev.status, newStatus: updates.status }),
          });
        } catch {
          /* non-blocking */
        }
      }
      if (updates.payment_status === "paid" && prev.payment_status !== "paid" && order.seller_id) {
        await supabase.from("order_events").insert({
          order_id: order.id,
          seller_id: order.seller_id,
          event_type: "payment_confirmed_dashboard",
          status: updates.status ?? prev.status,
          payment_status: "paid",
          source: "dashboard",
        });
      }
    },
    [supabase, updateOrder, toast],
  );

  return { updateOrder, patchOrder };
}
