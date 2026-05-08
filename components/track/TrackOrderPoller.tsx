"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export type TrackRow = {
  order_id: string;
  status: string;
  payment_status: string | null;
  total_amount: number | null;
  created_at: string;
  delivery_area: string | null;
  store_name: string;
  city: string | null;
  scheduled_for: string | null;
  rider_label: string | null;
};

export function TrackOrderPoller({ slug, initial }: { slug: string; initial: TrackRow }) {
  const [row, setRow] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/track/${encodeURIComponent(slug)}`);
        const j = (await res.json()) as { data?: TrackRow | null };
        if (!cancelled && j.data) setRow(j.data);
      } catch {
        /* ignore */
      }
    }, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [slug]);

  const steps = [
    { key: "recv", label: "Received", done: true },
    {
      key: "prep",
      label: "Preparing",
      done: ["preparing", "paid", "out_for_delivery", "delivered"].includes(row.status),
    },
    {
      key: "out",
      label: "Out for delivery",
      done: row.status === "out_for_delivery" || row.status === "delivered",
    },
    { key: "done", label: "Delivered", done: row.status === "delivered" },
  ];

  return (
    <div className="min-h-screen bg-[--bg-base] px-4 py-10 text-[--text-primary]">
      <div className="mx-auto max-w-md">
        <p className="text-center font-mono text-sm tracking-wide text-[--accent]">PORTER</p>
        <h1 className="mt-2 text-center text-xl font-semibold">{row.store_name}</h1>
        <p className="mt-1 text-center text-sm text-[--text-secondary]">{row.city ?? "India"}</p>

        <div className="mt-8 rounded-[var(--radius-lg)] border border-[--border] bg-[--bg-surface] p-5 shadow-xl">
          <p className="text-label text-[--text-muted]">Order</p>
          <p className="font-mono text-lg text-[--accent]">{String(row.order_id).slice(0, 8)}</p>
          <p className="mt-3 text-sm text-[--text-secondary]">
            Placed {new Date(row.created_at).toLocaleString()}
            {row.delivery_area ? ` · ${row.delivery_area}` : ""}
          </p>
          {row.scheduled_for ? (
            <p className="mt-2 text-sm text-[--warning]">Scheduled: {new Date(row.scheduled_for).toLocaleString()}</p>
          ) : null}
          {row.rider_label ? <p className="mt-2 text-sm text-[--text-secondary]">Rider: {row.rider_label}</p> : null}
          <div className="mt-4 flex justify-between border-t border-[--border] pt-4">
            <span className="text-[--text-secondary]">Amount</span>
            <span className="font-mono text-lg">
              ₹{Math.round(Number(row.total_amount ?? 0)).toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-2 text-center text-sm capitalize text-[--text-secondary]">
            Status: <span className="font-semibold text-[--text-primary]">{row.status.replace(/_/g, " ")}</span>
            {row.payment_status ? (
              <>
                {" "}
                · Payment: <span className="text-[--text-primary]">{row.payment_status}</span>
              </>
            ) : null}
          </p>
        </div>

        <ol className="mt-8 space-y-4 border-l-2 border-[--accent]/40 pl-6 transition-colors duration-500">
          {steps.map((s) => (
            <li key={s.key} className="relative">
              <span
                className={cn(
                  "absolute -left-[25px] top-1.5 h-3 w-3 rounded-full ring-2 ring-[--bg-base] transition-colors duration-500",
                  s.done ? "bg-[--accent]" : "bg-[--border-strong]",
                )}
              />
              <p className={cn("font-medium transition-colors duration-300", s.done ? "text-[--text-primary]" : "text-[--text-muted]")}>
                {s.label}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center text-xs text-[--text-muted]">
          Status updates every 15 seconds. For changes, message the store on WhatsApp.
        </p>
      </div>
    </div>
  );
}
