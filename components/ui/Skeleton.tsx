import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "card" | "stat" | "table-row";

export type SkeletonProps = {
  variant?: SkeletonVariant;
  className?: string;
  width?: string;
};

export function Skeleton({ variant = "text", className, width }: SkeletonProps) {
  const base = "animate-shimmer rounded-md bg-porter-bg-border/60";

  if (variant === "card") {
    return (
      <div
        className={cn(base, "h-32 w-full", className)}
        aria-hidden
      />
    );
  }

  if (variant === "stat") {
    return (
      <div className={cn("flex flex-col gap-space-2", className)} aria-hidden>
        <div className={cn(base, "h-10 w-2/3")} />
        <div className={cn(base, "h-3 w-20")} />
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className={cn("flex gap-space-3 py-space-3", className)} aria-hidden>
        <div className={cn(base, "h-4 flex-1")} />
        <div className={cn(base, "h-4 w-24")} />
        <div className={cn(base, "h-4 w-20")} />
      </div>
    );
  }

  return (
    <div
      className={cn(base, "h-4", width ?? "w-full max-w-[200px]", className)}
      aria-hidden
    />
  );
}
