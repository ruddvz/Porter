import type { OrderStatus } from "@/types";

/** Allowed manual/dashboard status moves (excluding payment side-effects). */
const ALLOWED: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending: ["confirmed", "cancelled", "preparing"],
  confirmed: ["preparing", "cancelled", "out_for_delivery"],
  preparing: ["paid", "out_for_delivery", "cancelled"],
  paid: ["preparing", "out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  const next = ALLOWED[from];
  return next?.includes(to) ?? false;
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "preparing":
      return "Preparing";
    case "paid":
      return "Paid";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
