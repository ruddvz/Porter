"use client";

import type { TopBarRecentOrder } from "@/components/dashboard/TopBar";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

async function fetchPendingSnapshot(sellerId: string): Promise<{ count: number; recent: TopBarRecentOrder[] }> {
  const supabase = createSupabaseBrowserClient();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", sellerId)
    .eq("status", "pending");
  const { data: recent } = await supabase
    .from("orders")
    .select("id,customer_name,total_amount,created_at")
    .eq("seller_id", sellerId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);
  return { count: count ?? 0, recent: recent ?? [] };
}

/** Plan0 §3 — live pending-order count + bell list from Supabase Realtime (`orders`). */
export function useSellerPendingOrdersRealtime(
  sellerId: string,
  initialCount: number,
  initialRecent: TopBarRecentOrder[],
) {
  const [pendingOrderCount, setPendingOrderCount] = useState(initialCount);
  const [recentPendingOrders, setRecentPendingOrders] = useState(initialRecent);

  useEffect(() => {
    setPendingOrderCount(initialCount);
    setRecentPendingOrders(initialRecent);
  }, [sellerId, initialCount, initialRecent]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let channel: RealtimeChannel | null = null;

    const refresh = () => {
      void fetchPendingSnapshot(sellerId).then(({ count, recent }) => {
        setPendingOrderCount(count);
        setRecentPendingOrders(recent);
      });
    };

    channel = supabase
      .channel(`seller-pending-orders-${sellerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `seller_id=eq.${sellerId}` },
        () => refresh(),
      )
      .subscribe();

    return () => {
      if (channel) void supabase.removeChannel(channel);
    };
  }, [sellerId]);

  return { pendingOrderCount, recentPendingOrders };
}
