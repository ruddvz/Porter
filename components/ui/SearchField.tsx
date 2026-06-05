"use client";

import { cn } from "@/lib/cn";
import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function SearchField({
  value,
  onChange,
  onClear,
  placeholder = "Search",
  className,
  id,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-porter-text-muted" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-[var(--po-radius-sm)] border border-porter-bg-border bg-porter-bg-surface py-2.5 pl-10 pr-10 text-base text-porter-text-primary placeholder:text-porter-text-muted focus:border-porter-green-500 focus:outline-none focus:ring-2 focus:ring-porter-green-500/20"
        {...rest}
      />
      {value ? (
        <button
          type="button"
          className="po-touch absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-porter-text-muted hover:bg-porter-bg-raised"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            onClear?.();
          }}
        >
          <X className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}
