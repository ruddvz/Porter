import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "raised" | "glow";
type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  clickable?: boolean;
  children: ReactNode;
};

const variantCls: Record<CardVariant, string> = {
  default: "bg-porter-bg-surface border border-porter-bg-border shadow-card",
  raised: "bg-porter-bg-raised border border-porter-bg-border shadow-raised",
  glow:
    "bg-porter-bg-surface border border-porter-bg-border shadow-card transition-shadow duration-porter hover:shadow-glow hover:border-porter-green-500/20",
};

const paddingCls: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-space-3",
  md: "p-space-4",
  lg: "p-space-6",
};

export function Card({
  variant = "default",
  padding = "md",
  clickable = false,
  className,
  children,
  role,
  tabIndex,
  ...rest
}: CardProps) {
  return (
    <div
      role={clickable ? "button" : role}
      tabIndex={clickable ? 0 : tabIndex}
      className={cn(
        "rounded-xl",
        variantCls[variant],
        paddingCls[padding],
        clickable &&
          "cursor-pointer hover:bg-porter-bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-porter-green-500",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
