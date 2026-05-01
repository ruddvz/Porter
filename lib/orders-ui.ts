import type { BadgeStatusVariant } from "@/components/ui/Badge";
import type { Order, OrderStatus } from "@/types";

export type OrderWithItems = Order & { order_items?: import("@/types").OrderItem[] };

export function formatCurrencyInr(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `₹${Math.round(Number(amount)).toLocaleString("en-IN")}`;
}

export function orderStatusBadge(status: OrderStatus): { label: string; variant: BadgeStatusVariant } {
  switch (status) {
    case "pending":
      return { label: "Pending", variant: "unpaid" };
    case "confirmed":
      return { label: "Confirmed", variant: "dispatched" };
    case "preparing":
      return { label: "Preparing", variant: "dispatched" };
    case "paid":
      return { label: "Paid", variant: "paid" };
    case "out_for_delivery":
      return { label: "Out for delivery", variant: "dispatched" };
    case "delivered":
      return { label: "Delivered", variant: "delivered" };
    case "cancelled":
      return { label: "Cancelled", variant: "cancelled" };
    default:
      return { label: status, variant: "unpaid" };
  }
}

export function paymentBadge(order: Order): {
  label: string;
  statusVariant: BadgeStatusVariant;
  methodLabel: string;
} {
  const method =
    order.payment_method === "cod"
      ? "COD"
      : order.payment_method === "upi_manual"
        ? "UPI"
        : order.payment_method === "razorpay"
          ? "Online"
          : "—";

  const st = order.payment_status;
  if (order.payment_method === "cod") {
    if (st === "cod_collected") return { label: "COD collected", statusVariant: "paid", methodLabel: method };
    if (st === "cod_pending") return { label: "COD pending", statusVariant: "cod", methodLabel: method };
  }
  if (st === "paid") return { label: "Paid", statusVariant: "paid", methodLabel: method };
  if (st === "refunded") return { label: "Refunded", statusVariant: "cancelled", methodLabel: method };
  return { label: "Unpaid", statusVariant: "unpaid", methodLabel: method };
}

export function itemSummaryLine(items: import("@/types").OrderItem[] | undefined, maxNames = 2): string {
  if (!items?.length) return "—";
  const first = items.slice(0, maxNames).map((i) => `${i.product_name} ${i.quantity}${i.unit}`);
  const more = items.length > maxNames ? `, +${items.length - maxNames} more` : "";
  return first.join(", ") + more;
}

export function minutesSince(iso: string, nowMs: number): number {
  return Math.floor((nowMs - new Date(iso).getTime()) / 60000);
}

export function pendingTimeUrgency(status: OrderStatus, createdAt: string, nowMs: number): "normal" | "warn" | "critical" {
  if (status !== "pending") return "normal";
  const m = minutesSince(createdAt, nowMs);
  if (m > 30) return "critical";
  if (m > 15) return "warn";
  return "normal";
}

export function timeAgoLabel(iso: string, nowMs: number): string {
  const s = Math.floor((nowMs - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} mins ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
