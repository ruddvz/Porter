import { Badge, type BadgeStatusVariant } from "@/components/ui/Badge";

export type PaymentBadgeProps = {
  status: string | null | undefined;
  className?: string;
};

const paymentMap: Record<string, { label: string; variant: BadgeStatusVariant }> = {
  cod: { label: "COD", variant: "cod" },
  cod_pending: { label: "COD pending", variant: "cod" },
  upi_pending: { label: "UPI pending", variant: "unpaid" },
  unpaid: { label: "Unpaid", variant: "unpaid" },
  paid: { label: "Paid", variant: "paid" },
  failed: { label: "Failed", variant: "cancelled" },
  refunded: { label: "Refunded", variant: "cancelled" },
};

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const key = (status ?? "unpaid").toLowerCase();
  const mapped = paymentMap[key] ?? { label: key.replace(/_/g, " "), variant: "unpaid" as const };
  return <Badge label={mapped.label} variant={mapped.variant} className={className} />;
}
