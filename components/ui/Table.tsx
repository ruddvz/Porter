"use client";

import { cn } from "@/lib/cn";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { EmptyState } from "./EmptyState";

export type SortDir = "asc" | "desc" | null;

export type TableColumn<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  cell: (row: T) => ReactNode;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  sortKey?: string | null;
  sortDir?: SortDir;
  onSortChange?: (key: string, dir: "asc" | "desc") => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIllustration?: ReactNode;
  className?: string;
};

export function Table<T>({
  columns,
  rows,
  getRowKey,
  sortKey,
  sortDir,
  onSortChange,
  emptyTitle = "Nothing here yet",
  emptyDescription = "When data arrives, it will show up in this table.",
  emptyIllustration,
  className,
}: TableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function headerClick(col: TableColumn<T>) {
    if (!col.sortable || !onSortChange) return;
    const next =
      sortKey === col.key
        ? sortDir === "asc"
          ? "desc"
          : "asc"
        : "asc";
    onSortChange(col.key, next);
  }

  if (rows.length === 0) {
    return (
      <div className={cn("rounded-xl border border-porter-bg-border bg-porter-bg-surface", className)}>
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          illustration={emptyIllustration}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none absolute left-0 top-0 z-[1] hidden h-full w-6 bg-gradient-to-r from-porter-bg-base to-transparent sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-[1] hidden h-full w-6 bg-gradient-to-l from-porter-bg-base to-transparent sm:block"
        aria-hidden
      />
      <div
        ref={scrollRef}
        className="relative overflow-x-auto rounded-xl border border-porter-bg-border bg-porter-bg-surface shadow-card"
      >
        <table className="min-w-full border-collapse text-left text-body">
          <thead className="sticky top-0 z-[2] bg-porter-bg-raised shadow-[inset_0_-1px_0_0] shadow-porter-bg-border">
            <tr>
              {columns.map((col) => {
                const active = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-label text-porter-text-muted",
                      col.sortable && "cursor-pointer select-none hover:text-porter-text-secondary",
                      col.className,
                    )}
                  >
                    <button
                      type="button"
                      disabled={!col.sortable}
                      onClick={() => headerClick(col)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-1 rounded-md px-1 font-inherit",
                        !col.sortable && "cursor-default",
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="inline-flex flex-col text-porter-text-muted">
                          <ChevronUp
                            className={cn(
                              "-mb-1 h-3 w-3",
                              active && sortDir === "asc" && "text-porter-green-400",
                            )}
                            aria-hidden
                          />
                          <ChevronDown
                            className={cn(
                              "-mt-1 h-3 w-3",
                              active && sortDir === "desc" && "text-porter-green-400",
                            )}
                            aria-hidden
                          />
                        </span>
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-t border-porter-bg-border transition-colors duration-fast hover:bg-porter-bg-raised/60"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 align-middle text-porter-text-primary", col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
