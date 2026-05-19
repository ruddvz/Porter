import {
  commitSaleForOrder,
  recordInventoryMovement,
  releaseReservationsForOrder,
} from "@/lib/inventory";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { OrderStatus } from "@/types";

/** Sync inventory ledger when order status changes (cancel → release, deliver → sale). */
export async function syncInventoryForOrderStatusChange(params: {
  sellerId: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { sellerId, orderId, previousStatus, newStatus } = params;
  if (newStatus === previousStatus) return { ok: true };

  if (newStatus === "cancelled" && previousStatus !== "cancelled") {
    return releaseReservationsForOrder(sellerId, orderId);
  }

  if (newStatus === "delivered" && previousStatus !== "delivered") {
    const supabase = createSupabaseServiceRoleClient();
    const { data: activeRes } = await supabase
      .from("stock_reservations")
      .select("id")
      .eq("seller_id", sellerId)
      .eq("order_id", orderId)
      .eq("status", "active");

    if (activeRes?.length) {
      return commitSaleForOrder(sellerId, orderId);
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    for (const it of items ?? []) {
      if (!it.product_id) continue;
      const mov = await recordInventoryMovement({
        sellerId,
        productId: it.product_id,
        movementType: "sale",
        quantityChange: -Number(it.quantity),
        reason: "Order delivered",
        source: "order",
        orderId,
      });
      if (!mov.ok) return mov;
    }
    return { ok: true };
  }

  return { ok: true };
}

export function statusTriggersInventorySync(status: OrderStatus): boolean {
  return status === "cancelled" || status === "delivered";
}
