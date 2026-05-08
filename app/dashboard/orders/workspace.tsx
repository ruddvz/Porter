"use client";

import LiveOrdersBoard from "@/components/dashboard/LiveOrdersBoard";
import type { OrderWithItems } from "@/lib/orders-ui";
import type { Seller } from "@/types";
import { cn } from "@/lib/cn";
import { LayoutGrid, Table2 } from "lucide-react";
import { useState } from "react";
import OrderHistoryClient from "./ui";

export default function OrdersWorkspace({
  seller,
  initialOrders,
  pageSize,
}: {
  seller: Seller;
  initialOrders: OrderWithItems[];
  pageSize: number;
}) {
  const [view, setView] = useState<"board" | "table">("board");

  return (
    <div className="pb-6">
      <div className="sticky top-14 z-30 flex justify-center border-b border-porter-bg-border bg-porter-bg-base/90 px-3 py-2 backdrop-blur md:top-[3.5rem] lg:justify-start lg:pl-[calc(220px+1rem)]">
        <div className="inline-flex rounded-[var(--radius-sm)] border border-porter-bg-border p-0.5">
          <button
            type="button"
            aria-label="Kanban board"
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 font-mono text-xs transition-colors sm:min-w-0 sm:px-4",
              view === "board"
                ? "bg-[--accent] text-black"
                : "text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary",
            )}
            onClick={() => setView("board")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Board</span>
          </button>
          <button
            type="button"
            aria-label="Table view"
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 font-mono text-xs transition-colors sm:min-w-0 sm:px-4",
              view === "table"
                ? "bg-[--accent] text-black"
                : "text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary",
            )}
            onClick={() => setView("table")}
          >
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {view === "board" ? (
        <LiveOrdersBoard seller={seller} initialOrders={initialOrders} />
      ) : (
        <OrderHistoryClient seller={seller} initialOrders={initialOrders} pageSize={pageSize} />
      )}
    </div>
  );
}
