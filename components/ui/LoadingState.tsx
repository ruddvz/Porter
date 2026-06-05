import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

export type LoadingStateProps = {
  title?: string;
  description?: string;
  variant?: "spinner" | "skeleton";
  className?: string;
};

export function LoadingState({
  title = "Loading…",
  description,
  variant = "spinner",
  className,
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)} aria-busy="true" aria-label={title}>
        <Skeleton className="h-28 w-full rounded-[var(--po-radius-lg)]" />
        <Skeleton className="h-20 w-full rounded-[var(--po-radius-lg)]" />
        <Skeleton className="h-20 w-full rounded-[var(--po-radius-lg)]" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-12 text-center", className)} aria-busy="true">
      <Loader2 className="h-8 w-8 animate-spin text-porter-green-600" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-porter-text-primary">{title}</p>
        {description ? <p className="mt-1 text-sm text-porter-text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
