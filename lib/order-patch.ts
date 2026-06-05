import { canTransitionOrderStatus } from "@/lib/order-status-transitions";
import type { Order, OrderStatus } from "@/types";

/** Validate dashboard/API order patch before write. */
export function validateOrderPatch(
  order: Pick<Order, "status">,
  updates: Partial<Order>,
): { ok: true } | { ok: false; message: string } {
  if (updates.status && updates.status !== order.status) {
    if (!canTransitionOrderStatus(order.status as OrderStatus, updates.status as OrderStatus)) {
      return {
        ok: false,
        message: `Cannot change status from ${order.status} to ${updates.status}`,
      };
    }
  }
  return { ok: true };
}
