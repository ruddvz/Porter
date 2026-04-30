import { cn } from "@/lib/cn";

export type SkeletonVariant = "text" | "card" | "stat" | "table-row";

export type SkeletonProps = {
  variant?: SkeletonVariant;
  className?: string;
  /** For text variant — width hint */
  width?: "full" | "3/4" | "1/2" | "1/4";
};

const widthCls = {
  full: "w-full",
  "3/4": "w-3/4",
  "1/2": "w-1/2",
  "1/4": "w-1/4",
};

export function Skeleton({ variant = "text", className, width = "full" }: SkeletonProps) {
  const base =
    "rounded-md bg-gradient-to-r from-porter-bg-border via-porter-bg-raised to-porter-bg-border bg-[length:200%_100%] animate-porter-shimmer";

  if (variant === "card") {
    return (
      <div
        className={cn(
          base,
          "h-32 w-full rounded-xl border border-porter-bg-border/60",
          className,
        )}
        aria-hidden
      />
    );
  }
  if (variant === "stat") {
    return <div className={cn(base, "h-9 w-24 rounded-lg", className)} aria-hidden />;
  }
  if (variant === "table-row") {
    return <div className={cn(base, "h-11 w-full rounded-md", className)} aria-hidden />;
  }
  return (
    <div
      className={cn(base, "h-3 rounded", widthCls[width], className)}
      aria-hidden
    />
  );
}
