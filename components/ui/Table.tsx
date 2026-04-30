"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

export type TableColumn<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  className?: string;
  cell: (row: T) => ReactNode;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string, dir: "asc" | "desc") => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  className?: string;
};

export function Table<T>({
  columns,
  data,
  getRowKey,
  sortKey,
  sortDir,
  onSortChange,
  emptyTitle = "No data yet",
  emptyDescription,
  emptyIcon,
  className,
}: TableProps<T>) {
  const handleSort = (col: TableColumn<T>) => {
    if (!col.sortable || !onSortChange) return;
    const nextDir =
      sortKey === col.id ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    onSortChange(col.id, nextDir);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative overflow-x-auto rounded-xl border border-porter-bg-border bg-porter-bg-surface shadow-card">
        {/* subtle edge fades on mobile */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-6 bg-gradient-to-r from-porter-bg-surface to-transparent md:hidden"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-6 bg-gradient-to-l from-porter-bg-surface to-transparent md:hidden"
          aria-hidden
        />
        {data.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <table className="min-w-[640px] w-full border-collapse text-left">
            <thead className="sticky top-0 z-[2] bg-porter-bg-raised/95 backdrop-blur-sm">
              <tr className="border-b border-porter-bg-border">
                {columns.map((col) => {
                  const active = sortKey === col.id;
                  return (
                    <th
                      key={col.id}
                      scope="col"
                      className={cn(
                        "text-label text-porter-text-secondary px-space-4 py-space-3",
                        col.sortable && "cursor-pointer select-none hover:text-porter-text-primary",
                        col.className
                      )}
                      onClick={() => handleSort(col)}
                      onKeyDown={(e) => {
                        if (col.sortable && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          handleSort(col);
                        }
                      }}
                      tabIndex={col.sortable ? 0 : undefined}
                      aria-sort={
                        !col.sortable
                          ? undefined
                          : !active
                            ? "none"
                            : sortDir === "asc"
                              ? "ascending"
                              : "descending"
                      }
                    >
                      <span className="inline-flex items-center gap-space-1">
                        {col.header}
                        {col.sortable && (
                          <span className="text-porter-text-muted" aria-hidden>
                            {!active && <ArrowUpDown className="h-3.5 w-3.5" />}
                            {active && sortDir === "asc" && (
                              <ArrowUp className="h-3.5 w-3.5 text-porter-green-500" />
                            )}
                            {active && sortDir === "desc" && (
                              <ArrowDown className="h-3.5 w-3.5 text-porter-green-500" />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-b border-porter-bg-border/80 transition-colors hover:bg-porter-bg-raised/60"
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "text-body text-porter-text-primary px-space-4 py-space-3 align-middle",
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
