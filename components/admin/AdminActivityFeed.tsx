"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { PlatformEventRow } from "@/lib/admin-platform-events";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";

export default function AdminActivityFeed({ initial }: { initial: PlatformEventRow[] }) {
  const supabase = createSupabaseBrowserClient();
  const [rows, setRows] = useState(initial);

  useEffect(() => {
    const ch = supabase
      .channel("platform_events_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "platform_events" },
        (payload) => {
          const n = payload.new as PlatformEventRow;
          setRows((prev) => [n, ...prev].slice(0, 50));
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [supabase]);

  const sorted = useMemo(() => [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [rows]);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-title">Live activity</h2>
        <Badge kind="status" variant="paid" label="Realtime" size="sm" />
      </div>
      <ul className="mt-4 max-h-[420px] space-y-3 overflow-y-auto">
        {sorted.length === 0 ? (
          <li className="text-body text-porter-text-muted">No platform events yet.</li>
        ) : (
          sorted.map((e) => (
            <li key={e.id} className="rounded-lg border border-porter-bg-border bg-porter-bg-surface px-3 py-2 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-porter-text-primary">{e.event_type}</span>
                <span className="text-mono text-xs text-porter-text-muted">{new Date(e.created_at).toLocaleString()}</span>
              </div>
              {e.notes ? <p className="mt-1 text-porter-text-secondary">{e.notes}</p> : null}
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
