"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

/** Live badge count for orders with `status = pending` for the seller. */
export function useRealtimePendingCount(sellerId: string, initial: number) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    setCount(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function refresh() {
      const { count: c } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId)
        .eq("status", "pending");
      setCount(c ?? 0);
    }

    const channel: RealtimeChannel = supabase
      .channel(`pending-orders-${sellerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `seller_id=eq.${sellerId}` },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId]);

  return count;
}
