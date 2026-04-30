import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Button } from "./Button";

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-space-4 px-space-6 py-space-10 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-porter-bg-border text-porter-text-muted">
          {icon}
        </div>
      )}
      <div className="max-w-sm space-y-space-2">
        <h3 className="text-title text-porter-text-primary">{title}</h3>
        {description && (
          <p className="text-body text-porter-text-secondary">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button type="button" variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
