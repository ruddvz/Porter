import { cn } from "@/lib/utils";

export type BadgeStatusVariant =
  | "paid"
  | "unpaid"
  | "cod"
  | "dispatched"
  | "delivered"
  | "cancelled";
export type BadgePlanVariant = "starter" | "growth";
export type BadgeType = "pill" | "square";

type BadgeProps = {
  label: string;
  size?: "sm" | "md";
  type?: BadgeType;
  live?: boolean;
} & (
  | { variant: "status"; status: BadgeStatusVariant }
  | { variant: "plan"; plan: BadgePlanVariant }
);

const statusStyles: Record<BadgeStatusVariant, string> = {
  paid: "bg-porter-status-paid/15 text-porter-status-paid border-porter-status-paid/30",
  unpaid: "bg-porter-status-unpaid/15 text-porter-status-unpaid border-porter-status-unpaid/30",
  cod: "bg-porter-status-cod/15 text-porter-status-cod border-porter-status-cod/30",
  dispatched:
    "bg-porter-status-dispatched/15 text-porter-status-dispatched border-porter-status-dispatched/30",
  delivered:
    "bg-porter-status-delivered/15 text-porter-status-delivered border-porter-status-delivered/30",
  cancelled:
    "bg-porter-status-cancelled/15 text-porter-status-cancelled border-porter-status-cancelled/30",
};

const livePulseStatuses: BadgeStatusVariant[] = [
  "unpaid",
  "cod",
  "dispatched",
];

const planStyles: Record<BadgePlanVariant, string> = {
  starter: "bg-porter-bg-raised text-porter-text-secondary border-porter-bg-border",
  growth: "bg-porter-green-900/40 text-porter-green-400 border-porter-green-700/50",
};

export function Badge(props: BadgeProps) {
  const size = props.size ?? "md";
  const type: BadgeType = props.type ?? "pill";

  const sizeCls =
    size === "sm"
      ? "px-space-2 py-1 min-h-[28px] text-[10px]"
      : "px-space-3 py-space-1 min-h-[32px] text-xs";

  const shapeCls = type === "pill" ? "rounded-full" : "rounded-md";

  let colorCls = "";
  if (props.variant === "status") {
    colorCls = statusStyles[props.status];
  } else {
    colorCls = planStyles[props.plan];
  }

  const showPulse =
    props.variant === "status" &&
    props.live &&
    livePulseStatuses.includes(props.status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-space-2 border text-label max-w-full",
        sizeCls,
        shapeCls,
        colorCls
      )}
    >
      {showPulse && (
        <span
          className="relative flex h-2 w-2 shrink-0"
          aria-hidden
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-porter-green-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-porter-green-500" />
        </span>
      )}
      <span className="truncate">{props.label}</span>
    </span>
  );
}
