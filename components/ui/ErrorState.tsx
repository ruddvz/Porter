import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AlertCircle } from "lucide-react";

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "Your internet may be slow or the server could not respond. Try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 py-12 text-center", className)} role="alert">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--po-danger-soft)] text-porter-orange-500">
        <AlertCircle className="h-7 w-7" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="text-base font-semibold text-porter-text-primary">{title}</p>
        <p className="text-sm text-porter-text-muted">{description}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
