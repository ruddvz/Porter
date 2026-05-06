import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** CSV export of all platform orders (super-admin tooling). Guarded by CRON_SECRET or admin session. */
export async function GET(req: Request) {
  const cron = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
  let ok = cron;

  if (!ok) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: isAdmin } = await supabase.rpc("is_platform_admin");
      ok = !!isAdmin;
    }
  }

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: rows, error } = await admin
    .from("orders")
    .select(
      "id,created_at,seller_id,customer_phone,customer_name,total_amount,status,payment_method,payment_status,delivery_area,delivery_address,sellers(store_name)"
    )
    .order("created_at", { ascending: false })
    .limit(50_000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = [
    "order_id",
    "created_at",
    "seller_id",
    "store_name",
    "customer_phone",
    "customer_name",
    "total_amount",
    "status",
    "payment_method",
    "payment_status",
    "delivery_area",
    "delivery_address",
  ].join(",");

  const lines = (rows ?? []).map((r) => {
    const store = r.sellers as { store_name?: string } | null;
    return [
      esc(r.id),
      esc(r.created_at),
      esc(r.seller_id),
      esc(store?.store_name ?? ""),
      esc(r.customer_phone),
      esc(r.customer_name),
      esc(r.total_amount),
      esc(r.status),
      esc(r.payment_method),
      esc(r.payment_status),
      esc(r.delivery_area),
      esc(r.delivery_address),
    ].join(",");
  });

  const csv = [header, ...lines].join("\n");
  const filename = `porter-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
