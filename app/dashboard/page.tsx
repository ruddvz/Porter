import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { OrderWithItems } from "@/lib/orders-ui";
import { redirect } from "next/navigation";

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function localYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function paidLike(ps: string | null | undefined, pm: string | null | undefined) {
  if (ps === "paid" || ps === "cod_collected") return true;
  return pm === "cod" && ps === "cod_pending";
}

export default async function DashboardHome() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const now = new Date();
  const todayStart = startOfLocalDay(now);

  const thirtyAgo = new Date(now);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const fourteenAgo = new Date(now);
  fourteenAgo.setDate(fourteenAgo.getDate() - 14);

  const { data: ordersRaw } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (ordersRaw ?? []) as OrderWithItems[];

  const { data: todayRows } = await supabase
    .from("orders")
    .select("total_amount,payment_status,payment_method,created_at,status")
    .eq("seller_id", seller.id)
    .gte("created_at", todayStart.toISOString());

  let revenueToday = 0;
  let ordersToday = 0;
  for (const o of todayRows ?? []) {
    ordersToday += 1;
    if (paidLike(o.payment_status, o.payment_method)) {
      revenueToday += Number(o.total_amount ?? 0);
    }
  }

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id)
    .eq("status", "pending");

  const { data: windowOrders } = await supabase
    .from("orders")
    .select("status")
    .eq("seller_id", seller.id)
    .gte("created_at", thirtyAgo.toISOString());

  let delivered = 0;
  let pipeline = 0;
  for (const o of windowOrders ?? []) {
    if (o.status === "cancelled") continue;
    pipeline += 1;
    if (o.status === "delivered") delivered += 1;
  }
  const fulfillmentPct = pipeline === 0 ? 100 : Math.round((delivered / pipeline) * 100);

  const { data: seriesOrders } = await supabase
    .from("orders")
    .select("created_at,total_amount,payment_status,payment_method,status")
    .eq("seller_id", seller.id)
    .gte("created_at", fourteenAgo.toISOString())
    .neq("status", "cancelled");

  const byDay = new Map<string, number>();
  for (const o of seriesOrders ?? []) {
    if (!paidLike(o.payment_status, o.payment_method)) continue;
    const key = localYmd(new Date(o.created_at));
    byDay.set(key, (byDay.get(key) ?? 0) + Number(o.total_amount ?? 0));
  }

  const chartPoints: { date: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - i);
    dt.setHours(12, 0, 0, 0);
    const key = localYmd(dt);
    chartPoints.push({
      date: key.slice(5),
      revenue: Math.round(byDay.get(key) ?? 0),
    });
  }

  const { data: prodLow } = await supabase.from("products").select("id,name,stock_quantity,min_stock_alert").eq("seller_id", seller.id);

  const lowStockProducts = (prodLow ?? []).filter((p) => {
    const sq = p.stock_quantity ?? 0;
    const minA = (p as { min_stock_alert?: number }).min_stock_alert ?? 5;
    return sq <= minA;
  });

  return (
    <DashboardOverview
      seller={seller}
      initialOrders={orders}
      stats={{
        revenueToday,
        ordersToday,
        pendingCount: pendingCount ?? 0,
        fulfillmentPct,
      }}
      chartPoints={chartPoints}
      lowStockProducts={lowStockProducts}
    />
  );
}
