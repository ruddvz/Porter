import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  illustration?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, illustration, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        className,
      )}
    >
      {illustration && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-porter-bg-border bg-porter-bg-raised text-porter-text-muted">
          {illustration}
        </div>
      )}
      <div className="max-w-md space-y-2">
        <h3 className="text-heading text-porter-text-primary">{title}</h3>
        {description && <p className="text-body text-porter-text-secondary">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
