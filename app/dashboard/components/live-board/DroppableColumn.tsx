"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useDroppable } from "@dnd-kit/core";
import type { KanbanColumnId } from "./types";

export default function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: KanbanColumnId | "cancelled";
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`w-[min(90vw,320px)] shrink-0 snap-start xl:w-auto xl:min-w-0 xl:snap-align-none ${
        isOver ? "ring-2 ring-porter-green-500/40 ring-offset-2 ring-offset-porter-bg-base rounded-xl" : ""
      }`}
    >
      <Card padding="sm" className="flex max-h-[calc(100dvh-18rem)] min-h-[200px] flex-col xl:max-h-[calc(100dvh-14rem)]">
        <div className="flex shrink-0 items-center justify-between border-b border-porter-bg-border px-2 py-2">
          <span className="text-label text-porter-text-muted">{title}</span>
          <Badge
            kind="status"
            variant="paid"
            label={String(count)}
            size="sm"
            className="!bg-porter-bg-raised !text-porter-text-secondary !ring-porter-bg-border"
          />
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-1 py-3">{children}</div>
      </Card>
    </div>
  );
}
