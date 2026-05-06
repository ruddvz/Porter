import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type TrackRow = {
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

export default async function TrackOrderPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  if (!slug || slug.length < 8) notFound();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_order_by_track_slug", { sl: slug });

  if (error || !data?.length) notFound();

  const row = data[0] as TrackRow;

  const steps = [
    { key: "recv", label: "Received", done: true },
    { key: "prep", label: "Preparing", done: ["preparing", "paid", "out_for_delivery", "delivered"].includes(row.status) },
    {
      key: "out",
      label: "Out for delivery",
      done: row.status === "out_for_delivery" || row.status === "delivered",
    },
    { key: "done", label: "Delivered", done: row.status === "delivered" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-md">
        <p className="text-center font-display text-2xl tracking-wide text-emerald-400">PORTER</p>
        <h1 className="mt-2 text-center text-xl font-semibold">{row.store_name}</h1>
        <p className="mt-1 text-center text-sm text-zinc-400">{row.city ?? "India"}</p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Order</p>
          <p className="font-mono text-lg text-emerald-300">{String(row.order_id).slice(0, 8)}</p>
          <p className="mt-3 text-sm text-zinc-400">
            Placed {new Date(row.created_at).toLocaleString()}
            {row.delivery_area ? ` · ${row.delivery_area}` : ""}
          </p>
          {row.scheduled_for ? (
            <p className="mt-2 text-sm text-amber-200">Scheduled: {new Date(row.scheduled_for).toLocaleString()}</p>
          ) : null}
          {row.rider_label ? <p className="mt-2 text-sm text-zinc-300">Rider: {row.rider_label}</p> : null}
          <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4">
            <span className="text-zinc-400">Amount</span>
            <span className="font-mono text-lg">
              ₹{Math.round(Number(row.total_amount ?? 0)).toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-2 text-center text-sm capitalize text-zinc-400">
            Status: <span className="font-semibold text-zinc-100">{row.status.replace(/_/g, " ")}</span>
            {row.payment_status ? (
              <>
                {" "}
                · Payment: <span className="text-zinc-200">{row.payment_status}</span>
              </>
            ) : null}
          </p>
        </div>

        <ol className="mt-8 space-y-4 border-l-2 border-emerald-500/40 pl-6">
          {steps.map((s) => (
            <li key={s.key} className="relative">
              <span
                className={`absolute -left-[25px] top-1.5 h-3 w-3 rounded-full ring-2 ring-[#0a0a0f] ${
                  s.done ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              />
              <p className={`font-medium ${s.done ? "text-zinc-100" : "text-zinc-600"}`}>{s.label}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center text-xs text-zinc-600">
          This page shows order status only. For changes, message the store on WhatsApp.
        </p>
      </div>
    </div>
  );
}
