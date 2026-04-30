import { cn } from "@/lib/cn";

export type BadgeStatusVariant =
  | "paid"
  | "unpaid"
  | "cod"
  | "dispatched"
  | "delivered"
  | "cancelled";
export type BadgePlanVariant = "starter" | "growth";
export type BadgeKind = "status" | "plan";

type BadgeProps = {
  label: string;
  size?: "sm" | "md";
  /** status / plan variants */
  variant?: BadgeStatusVariant | BadgePlanVariant;
  kind?: BadgeKind;
  /** pill (rounded-full) or square (rounded-md) */
  type?: "pill" | "square";
  /** Pulsing dot for live-ish states (pending payment, dispatched, etc.) */
  pulse?: boolean;
  className?: string;
};

const statusStyles: Record<BadgeStatusVariant, string> = {
  paid: "bg-porter-status-paid/15 text-porter-status-paid ring-1 ring-porter-status-paid/30",
  unpaid: "bg-porter-status-unpaid/15 text-porter-status-unpaid ring-1 ring-porter-status-unpaid/30",
  cod: "bg-porter-status-cod/15 text-porter-status-cod ring-1 ring-porter-status-cod/30",
  dispatched:
    "bg-porter-status-dispatched/15 text-porter-status-dispatched ring-1 ring-porter-status-dispatched/30",
  delivered:
    "bg-porter-status-delivered/15 text-porter-status-delivered ring-1 ring-porter-status-delivered/30",
  cancelled:
    "bg-porter-status-cancelled/15 text-porter-status-cancelled ring-1 ring-porter-status-cancelled/30",
};

const planStyles: Record<BadgePlanVariant, string> = {
  starter: "bg-porter-bg-raised text-porter-text-secondary ring-1 ring-porter-bg-border",
  growth: "bg-porter-green-500/15 text-porter-green-400 ring-1 ring-porter-green-500/30",
};

function isStatus(v: BadgeProps["variant"]): v is BadgeStatusVariant {
  return (
    v === "paid" ||
    v === "unpaid" ||
    v === "cod" ||
    v === "dispatched" ||
    v === "delivered" ||
    v === "cancelled"
  );
}

function isPlan(v: BadgeProps["variant"]): v is BadgePlanVariant {
  return v === "starter" || v === "growth";
}

export function Badge({
  label,
  size = "md",
  variant = "paid",
  kind = "status",
  type = "pill",
  pulse = false,
  className,
}: BadgeProps) {
  const sizeCls =
    size === "sm" ? "min-h-[28px] px-2 py-0.5 text-[11px]" : "min-h-9 px-2.5 py-1 text-label";
  const shape = type === "pill" ? "rounded-full" : "rounded-md";
  const variantCls =
    kind === "plan" && isPlan(variant)
      ? planStyles[variant]
      : kind === "status" && isStatus(variant)
        ? statusStyles[variant]
        : statusStyles.paid;

  const showDot =
    pulse &&
    kind === "status" &&
    isStatus(variant) &&
    (variant === "unpaid" || variant === "dispatched" || variant === "cod");

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 font-sans font-semibold tracking-wide text-label",
        sizeCls,
        shape,
        variantCls,
        className,
      )}
    >
      {showDot && (
        <span
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current animate-porter-pulse-dot"
          aria-hidden
        />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}
