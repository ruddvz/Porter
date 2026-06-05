import type { OrderStatus } from "@/types";
import type { OrderWithItems } from "@/lib/orders-ui";

export type KanbanColumnId = OrderStatus | "awaiting_payment";

export const COLUMN_ORDER: KanbanColumnId[] = [
  "pending",
  "confirmed",
  "awaiting_payment",
  "preparing",
  "paid",
  "out_for_delivery",
  "delivered",
];

export function isAwaitingPayment(o: OrderWithItems): boolean {
  return (
    o.status === "pending" &&
    (o.payment_method === "razorpay" || o.payment_method === "upi_manual") &&
    (o.payment_status === "unpaid" || o.payment_status == null)
  );
}

export function columnLabel(s: KanbanColumnId): string {
  switch (s) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "awaiting_payment":
      return "Awaiting payment";
    case "preparing":
      return "In progress";
    case "paid":
      return "Paid";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return s;
  }
}

export function workflowRank(o: OrderWithItems): number {
  if (o.status === "cancelled") return 900;
  if (o.status === "delivered") return 800;
  if (o.status === "out_for_delivery") return 700;
  if (o.status === "paid") return 600;
  if (o.status === "preparing") return 500;
  if (o.status === "confirmed") return 400;
  if (o.status === "pending") return isAwaitingPayment(o) ? 210 : 200;
  return 850;
}

export function listStageLabel(o: OrderWithItems): string {
  if (o.status === "cancelled") return "Cancelled";
  if (isAwaitingPayment(o)) return "Awaiting payment";
  return columnLabel(o.status as KanbanColumnId);
}

export function listAccentClass(o: OrderWithItems): string {
  if (o.status === "cancelled") return "border-l-porter-status-cancelled";
  if (isAwaitingPayment(o)) return "border-l-porter-orange-500";
  switch (o.status) {
    case "pending":
      return "border-l-amber-400";
    case "confirmed":
      return "border-l-sky-400";
    case "preparing":
      return "border-l-teal-400";
    case "paid":
      return "border-l-porter-green-500";
    case "out_for_delivery":
      return "border-l-violet-400";
    case "delivered":
      return "border-l-emerald-600";
    default:
      return "border-l-porter-bg-border";
  }
}

export function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const n = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
