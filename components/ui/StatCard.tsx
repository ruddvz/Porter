import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Skeleton } from "./Skeleton";

export type StatCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "up" | "down";
  prefix?: string;
  loading?: boolean;
  highlight?: "none" | "orange" | "green";
  className?: string;
};

export function StatCard({
  label,
  value,
  delta,
  deltaType = "up",
  prefix,
  loading,
  highlight = "none",
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-porter-bg-border bg-porter-bg-surface p-space-4 shadow-card",
          className
        )}
      >
        <Skeleton variant="text" className="mb-space-3 h-3 w-24" />
        <Skeleton variant="stat" />
      </div>
    );
  }

  const highlightCls =
    highlight === "orange"
      ? "ring-1 ring-porter-orange-500/30"
      : highlight === "green"
        ? "ring-1 ring-porter-green-500/25"
        : "";

  return (
    <div
      className={cn(
        "rounded-xl border border-porter-bg-border bg-porter-bg-surface p-space-4 shadow-card",
        highlightCls,
        className
      )}
    >
      <p className="text-label text-porter-text-muted">{label}</p>
      <div className="mt-space-2 flex flex-wrap items-end gap-space-2">
        <p className="text-display text-porter-text-primary">
          {prefix ? (
            <>
              <span className="text-porter-green-400">{prefix}</span>
              <span className="ml-1">{value}</span>
            </>
          ) : (
            value
          )}
        </p>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold font-sans",
              deltaType === "up" ? "text-porter-green-400" : "text-porter-orange-500"
            )}
          >
            {deltaType === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
            )}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
