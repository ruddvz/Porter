import { cn } from "@/lib/cn";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Skeleton } from "./Skeleton";

export type StatCardProps = {
  label: string;
  value: string | number;
  prefix?: string;
  delta?: string;
  deltaType?: "up" | "down";
  loading?: boolean;
  className?: string;
  /** Highlight value (e.g. pending count warning) */
  valueTone?: "default" | "warning" | "success";
};

export function StatCard({
  label,
  value,
  prefix,
  delta,
  deltaType = "up",
  loading,
  className,
  valueTone = "default",
}: StatCardProps) {
  const toneCls =
    valueTone === "warning"
      ? "text-porter-orange-500"
      : valueTone === "success"
        ? "text-porter-green-400"
        : "text-porter-text-primary";

  return (
    <div
      className={cn(
        "rounded-xl border border-porter-bg-border bg-porter-bg-surface p-4 shadow-card md:p-5",
        className,
      )}
    >
      <p className="text-label text-porter-text-muted">{label}</p>
      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton variant="stat" className="h-10 w-28" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      ) : (
        <>
          <p className={cn("mt-2 flex flex-wrap items-baseline gap-1 font-display text-display", toneCls)}>
            {prefix && <span className="text-porter-text-secondary">{prefix}</span>}
            <span>{value}</span>
          </p>
          {delta !== undefined && delta !== "" && (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
                deltaType === "up" ? "text-porter-green-400" : "text-porter-orange-500",
              )}
            >
              {deltaType === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
              )}
              {delta}
            </p>
          )}
        </>
      )}
    </div>
  );
}
