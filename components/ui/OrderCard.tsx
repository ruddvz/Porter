"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Badge, type BadgeStatusVariant } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";

export type OrderCardProps = {
  customerName: string;
  phone: string;
  itemsPreview: string;
  itemCount: number;
  totalRupee: number;
  orderStatusVariant: BadgeStatusVariant;
  orderStatusLabel: string;
  paymentStatusVariant: BadgeStatusVariant;
  paymentStatusLabel: string;
  relativeTime: string;
  pendingMinutes?: number;
  delivered?: boolean;
  codPending?: boolean;
  isNew?: boolean;
  actions?: ReactNode;
  onCardClick?: () => void;
  className?: string;
};

export function OrderCard({
  customerName,
  phone,
  itemsPreview,
  itemCount,
  totalRupee,
  orderStatusVariant,
  orderStatusLabel,
  paymentStatusVariant,
  paymentStatusLabel,
  relativeTime,
  pendingMinutes,
  delivered = false,
  codPending = false,
  isNew = false,
  actions,
  onCardClick,
  className,
}: OrderCardProps) {
  const timeColor =
    pendingMinutes !== undefined
      ? pendingMinutes > 30
        ? "text-porter-status-cancelled"
        : pendingMinutes > 15
          ? "text-porter-orange-500"
          : "text-porter-text-muted"
      : "text-porter-text-muted";

  return (
    <Card
      variant="default"
      padding="md"
      clickable={!!onCardClick}
      onClick={onCardClick}
      className={cn(
        "transition-shadow duration-[250ms] hover:shadow-raised",
        delivered && "opacity-60",
        isNew && "animate-slide-in-right animate-order-glow",
        className
      )}
    >
      <div className="flex flex-col gap-space-3">
        <div className="flex flex-wrap items-start justify-between gap-space-2">
          <div className="min-w-0">
            <p className="text-title text-porter-text-primary">{customerName}</p>
            <p className="text-mono text-porter-text-muted">{phone}</p>
          </div>
          <p className="text-display shrink-0 leading-none text-porter-green-400">
            <span className="text-porter-green-400">₹</span>
            <span className="ml-0.5">{totalRupee.toLocaleString("en-IN")}</span>
          </p>
        </div>

        <p className="text-body text-porter-text-secondary line-clamp-2">
          {itemsPreview}
          {itemCount > 0 && (
            <span className="text-porter-text-muted"> · {itemCount} items</span>
          )}
        </p>

        <div className="flex flex-wrap gap-space-2">
          <Badge
            variant="status"
            status={orderStatusVariant}
            label={orderStatusLabel}
            size="sm"
          />
          <Badge
            variant="status"
            status={paymentStatusVariant}
            label={paymentStatusLabel}
            size="sm"
          />
        </div>

        <p className={cn("text-xs font-medium font-sans", timeColor)}>{relativeTime}</p>

        {(actions || codPending) && (
          <div
            className="flex flex-wrap gap-space-2 border-t border-porter-bg-border pt-space-3"
            onClick={(e) => e.stopPropagation()}
          >
            {codPending && (
              <Button variant="primary" size="sm" className="bg-porter-orange-500 hover:bg-porter-orange-600">
                ₹ Mark cash collected
              </Button>
            )}
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}
