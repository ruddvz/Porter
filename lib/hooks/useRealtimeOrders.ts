"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Order } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

/** Subscribes to Supabase Realtime changes on orders for the current seller. */
export function useRealtimeOrders(
  sellerId: string,
  initial: Order[],
  options?: { playSoundOnNewOrder?: boolean },
) {
  const playSound = options?.playSoundOnNewOrder ?? false;
  const [orders, setOrders] = useState<Order[]>(initial);

  const playPing = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = 880;
      g.gain.value = 0.05;
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 120);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setOrders(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel: RealtimeChannel = supabase
      .channel(`orders-${sellerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `seller_id=eq.${sellerId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as Order;
            setOrders((prev) => [row, ...prev.filter((o) => o.id !== row.id)]);
            if (playSound) playPing();
          }
          if (payload.eventType === "UPDATE") {
            const row = payload.new as Order;
            setOrders((prev) => prev.map((o) => (o.id === row.id ? row : o)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId, playPing, playSound]);

  return { orders, setOrders };
}
