import { Badge, type BadgeStatusVariant } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types";
import { orderStatusBadge } from "@/lib/orders-ui";

export type StatusBadgeProps = {
  status: OrderStatus | string;
  className?: string;
};

const statusMap: Record<string, BadgeStatusVariant> = {
  pending: "unpaid",
  awaiting_payment: "unpaid",
  confirmed: "paid",
  preparing: "dispatched",
  ready: "dispatched",
  out_for_delivery: "dispatched",
  delivered: "delivered",
  cancelled: "cancelled",
  failed: "cancelled",
  refunded: "cancelled",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();
  if (normalized in statusMap) {
    const variant = statusMap[normalized]!;
    const label = normalized.replace(/_/g, " ");
    return <Badge label={label.charAt(0).toUpperCase() + label.slice(1)} variant={variant} className={className} />;
  }
  const mapped = orderStatusBadge(status as OrderStatus);
  return <Badge label={mapped.label} variant={mapped.variant} className={className} />;
}
