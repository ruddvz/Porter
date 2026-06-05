"use client";

import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-full max-w-full gap-1 rounded-pill border border-porter-bg-border bg-porter-bg-raised p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              "min-h-11 flex-1 rounded-pill px-3 text-sm font-semibold transition-colors",
              active
                ? "bg-porter-bg-surface text-porter-text-primary shadow-card"
                : "text-porter-text-muted hover:text-porter-text-primary",
            )}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
