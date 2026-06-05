"use client";

import { OrderCard as UiOrderCard } from "@/components/ui/OrderCard";
import {
  formatCurrencyInr,
  itemSummaryLine,
  orderStatusBadge,
  paymentBadge,
  pendingTimeUrgency,
  timeAgoLabel,
  type OrderWithItems,
} from "@/lib/orders-ui";
import type { Order } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import OrderRowQuickActions from "./OrderRowQuickActions";

export default function DraggableBoardCard({
  order,
  nowMs,
  onOpen,
  onPatch,
  dimmed,
  isNew,
}: {
  order: OrderWithItems;
  nowMs: number;
  onOpen: () => void;
  onPatch: (u: Partial<Order>) => void;
  dimmed?: boolean;
  isNew?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.55 : undefined,
  };

  const pay = paymentBadge(order);
  const status = orderStatusBadge(order.status);
  const urgency = pendingTimeUrgency(order.status, order.created_at, nowMs);
  const actions = <OrderRowQuickActions order={order} onPatch={onPatch} />;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <UiOrderCard
        customerName={order.customer_name || "Customer"}
        phone={order.customer_phone}
        itemsSummary={itemSummaryLine(order.order_items)}
        totalFormatted={formatCurrencyInr(order.total_amount)}
        statusLabel={status.label}
        statusVariant={status.variant}
        payment={{ label: pay.label, statusVariant: pay.statusVariant, methodLabel: pay.methodLabel }}
        timeLabel={timeAgoLabel(order.created_at, nowMs)}
        timeUrgency={urgency}
        actions={order.status === "delivered" || order.status === "cancelled" ? undefined : actions}
        dimmed={dimmed}
        isNew={isNew}
        onCardClick={onOpen}
      />
    </div>
  );
}
