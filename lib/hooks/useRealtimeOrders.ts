"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { OrderWithItems } from "@/lib/orders-ui";
import type { OrderItem } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

/** Subscribes to Supabase Realtime changes on orders + order_items for the current seller. */
export function useRealtimeOrders(
  sellerId: string,
  initial: OrderWithItems[],
  options?: { playSoundOnNewOrder?: boolean },
) {
  const playSound = options?.playSoundOnNewOrder ?? false;
  const [orders, setOrders] = useState<OrderWithItems[]>(initial);

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
            const row = payload.new as OrderWithItems;
            setOrders((prev) => [row, ...prev.filter((o) => o.id !== row.id)]);
            if (playSound) playPing();
          }
          if (payload.eventType === "UPDATE") {
            const row = payload.new as OrderWithItems;
            setOrders((prev) => prev.map((o) => (o.id === row.id ? row : o)));
          }
          if (payload.eventType === "DELETE") {
            const row = payload.old as { id?: string };
            if (row?.id) setOrders((prev) => prev.filter((o) => o.id !== row.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId, playPing, playSound]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel: RealtimeChannel = supabase
      .channel(`order-items-${sellerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: `seller_id=eq.${sellerId}`,
        },
        (payload) => {
          const mergeItem = (items: OrderItem[] | undefined, item: OrderItem, mode: "upsert" | "remove") => {
            const prev = items ?? [];
            if (mode === "remove") {
              return prev.filter((x) => x.id !== item.id);
            }
            const idx = prev.findIndex((x) => x.id === item.id);
            if (idx === -1) return [...prev, item];
            const next = [...prev];
            next[idx] = item;
            return next;
          };

          if (payload.eventType === "INSERT") {
            const row = payload.new as OrderItem;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === row.order_id ? { ...o, order_items: mergeItem(o.order_items, row, "upsert") } : o,
              ),
            );
          }
          if (payload.eventType === "UPDATE") {
            const row = payload.new as OrderItem;
            setOrders((prev) =>
              prev.map((o) =>
                o.id === row.order_id ? { ...o, order_items: mergeItem(o.order_items, row, "upsert") } : o,
              ),
            );
          }
          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id?: string })?.id;
            if (!deletedId) return;
            setOrders((prev) =>
              prev.map((o) => ({
                ...o,
                order_items: o.order_items?.filter((it) => it.id !== deletedId),
              })),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sellerId]);

  return { orders, setOrders };
}
