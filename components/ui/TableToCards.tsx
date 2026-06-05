import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type TableToCardsProps<T> = {
  rows: T[];
  getRowKey: (row: T) => string;
  renderCard: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  empty?: ReactNode;
};

/** Mobile-friendly card list — pair with `Table` hidden below `lg`. */
export function TableToCards<T>({ rows, getRowKey, renderCard, onRowClick, className, empty }: TableToCardsProps<T>) {
  if (rows.length === 0) {
    return empty ? <div className={cn("lg:hidden", className)}>{empty}</div> : null;
  }

  return (
    <ul className={cn("space-y-3 lg:hidden", className)}>
      {rows.map((row) => (
        <li key={getRowKey(row)}>
          {onRowClick ? (
            <button
              type="button"
              onClick={() => onRowClick(row)}
              className="w-full rounded-[var(--po-radius-lg)] border border-porter-bg-border bg-porter-bg-surface p-4 text-left shadow-card transition-colors hover:bg-porter-bg-raised"
            >
              {renderCard(row)}
            </button>
          ) : (
            <div className="rounded-[var(--po-radius-lg)] border border-porter-bg-border bg-porter-bg-surface p-4 shadow-card">
              {renderCard(row)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
