import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export type CardVariant = "default" | "raised" | "glow";
export type CardPadding = "sm" | "md" | "lg";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  clickable?: boolean;
};

const paddingCls: Record<CardPadding, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const variantCls: Record<CardVariant, string> = {
  default: "bg-porter-bg-surface border border-porter-bg-border shadow-card",
  raised: "bg-porter-bg-raised border border-porter-bg-border shadow-raised",
  glow:
    "bg-porter-bg-surface border border-porter-bg-border shadow-card transition-[box-shadow,transform,border-color] duration-base hover:border-porter-green-500/40 hover:shadow-glow",
};

export function Card({
  variant = "default",
  padding = "md",
  clickable = false,
  className,
  role,
  tabIndex,
  ...rest
}: CardProps) {
  return (
    <div
      role={clickable ? "button" : role}
      tabIndex={clickable ? tabIndex ?? 0 : tabIndex}
      className={cn(
        "rounded-xl",
        paddingCls[padding],
        variantCls[variant],
        clickable &&
          "cursor-pointer hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-porter-green-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-porter-bg-base",
        variant === "raised" &&
          clickable &&
          "hover:shadow-glow hover:border-porter-green-500/25",
        className,
      )}
      {...rest}
    />
  );
}
