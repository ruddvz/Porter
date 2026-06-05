"use client";

import { cn } from "@/lib/cn";

export function CategoryStrip({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}) {
  if (categories.length <= 1) return null;

  return (
    <div className="sticky top-0 z-10 border-b border-porter-bg-border bg-porter-bg-base/95 px-3 py-2 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const selected = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={cn(
                "shrink-0 min-h-10 rounded-[var(--po-radius-pill)] border px-4 text-sm font-semibold transition-colors",
                selected
                  ? "border-porter-green-500 bg-[var(--po-primary-soft)] text-porter-green-600"
                  : "border-porter-bg-border bg-porter-bg-surface text-porter-text-secondary",
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
