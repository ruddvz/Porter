"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { PlatformEventRow } from "@/lib/admin-platform-events";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useEffect, useMemo, useRef, useState } from "react";

function eventEmoji(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("order") && t.includes("fail")) return "🔴";
  if (t.includes("order") || t.includes("payment")) return "🟢";
  if (t.includes("signup") || t.includes("seller") || t.includes("onboard")) return "🔵";
  if (t.includes("impersonat")) return "🟣";
  if (t.includes("plan")) return "🟡";
  return "⚪";
}

/** Plan0 §11.4 — realtime platform activity with readable rows. */
export default function AdminActivityFeed({ initial }: { initial: PlatformEventRow[] }) {
  const supabase = createSupabaseBrowserClient();
  const [rows, setRows] = useState(initial);
  const listRef = useRef<HTMLUListElement>(null);
  const stickTopRef = useRef(true);

  useEffect(() => {
    const ch = supabase
      .channel("platform_events_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "platform_events" },
        (payload) => {
          const n = payload.new as PlatformEventRow;
          setRows((prev) => {
            const next = [n, ...prev].slice(0, 50);
            return next;
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !stickTopRef.current) return;
    el.scrollTop = 0;
  }, [rows]);

  const sorted = useMemo(() => [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [rows]);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-title">Live activity</h2>
        <Badge kind="status" variant="paid" label="Realtime" size="sm" />
      </div>
      <ul
        ref={listRef}
        onScroll={(e) => {
          const t = e.currentTarget;
          stickTopRef.current = t.scrollTop < 12;
        }}
        className="mt-4 max-h-[420px] space-y-2 overflow-y-auto"
      >
        {sorted.length === 0 ? (
          <li className="text-body text-porter-text-muted">No platform events yet.</li>
        ) : (
          sorted.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-porter-bg-border bg-porter-bg-surface px-3 py-2 font-mono text-xs leading-relaxed text-porter-text-secondary"
            >
              <span className="mr-2" aria-hidden>
                {eventEmoji(e.event_type)}
              </span>
              <span className="text-porter-text-muted">{new Date(e.created_at).toLocaleString()}</span>
              <span className="mx-2 text-porter-bg-border">—</span>
              <span className="font-semibold text-porter-text-primary">{e.event_type}</span>
              {e.notes ? (
                <>
                  <span className="mx-2 text-porter-bg-border">·</span>
                  <span>{e.notes}</span>
                </>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
