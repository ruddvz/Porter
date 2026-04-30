import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import AdminAnalyticsClient from "./ui";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = createSupabaseAdminClient();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const since90 = new Date(Date.now() - 90 * 86400000).toISOString();

  const { data: orders30 } = await supabase.from("orders").select("created_at,total_amount,payment_method,payment_status,seller_id").gte("created_at", since30);

  const byDay = new Map<string, number>();
  for (const o of orders30 ?? []) {
    const d = (o.created_at as string).slice(0, 10);
    byDay.set(d, (byDay.get(d) ?? 0) + 1);
  }
  const dailyOrders = Array.from(byDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sellerRev = new Map<string, number>();
  for (const o of orders30 ?? []) {
    if (o.payment_status !== "paid" && o.payment_status !== "cod_collected") continue;
    const sid = o.seller_id as string;
    sellerRev.set(sid, (sellerRev.get(sid) ?? 0) + Number(o.total_amount ?? 0));
  }
  const topIds = Array.from(sellerRev.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);
  const { data: sellersTop } = topIds.length
    ? await supabase.from("sellers").select("id,store_name").in("id", topIds)
    : { data: [] as { id: string; store_name: string }[] };
  const nameById = Object.fromEntries((sellersTop ?? []).map((s) => [s.id, s.store_name]));
  const revenueTop = topIds.map((id) => ({ name: nameById[id] ?? id, revenue: sellerRev.get(id) ?? 0 }));

  const pay = { razorpay: 0, cod: 0, upi_manual: 0 };
  for (const o of orders30 ?? []) {
    if (o.payment_method === "razorpay") pay.razorpay += 1;
    else if (o.payment_method === "cod") pay.cod += 1;
    else if (o.payment_method === "upi_manual") pay.upi_manual += 1;
  }
  const paySplit = [
    { name: "Razorpay", value: pay.razorpay },
    { name: "COD", value: pay.cod },
    { name: "Manual UPI", value: pay.upi_manual },
  ];

  const { data: signups } = await supabase.from("sellers").select("created_at").gte("created_at", since90);
  const byDayS = new Map<string, number>();
  for (const s of signups ?? []) {
    const d = (s.created_at as string).slice(0, 10);
    byDayS.set(d, (byDayS.get(d) ?? 0) + 1);
  }
  const signupsSeries = Array.from(byDayS.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const { count: totalSellers } = await supabase.from("sellers").select("*", { count: "exact", head: true });
  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
  const { data: paidAll } = await supabase.from("orders").select("total_amount").in("payment_status", ["paid", "cod_collected"]);
  const totalRev = (paidAll ?? []).reduce((s, r) => s + Number(r.total_amount ?? 0), 0);

  const { data: cityRows } = await supabase
    .from("orders")
    .select("delivery_area")
    .not("delivery_area", "is", null)
    .gte("created_at", since30);
  const cityCount = new Map<string, number>();
  for (const r of cityRows ?? []) {
    const c = (r.delivery_area as string) || "";
    if (!c) continue;
    cityCount.set(c, (cityCount.get(c) ?? 0) + 1);
  }
  const topCity = Array.from(cityCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const popularPay = paySplit.sort((a, b) => b.value - a.value)[0]?.name ?? "—";

  const months = Math.max(1, (Date.now() - new Date((signups?.[0]?.created_at as string) ?? since90).getTime()) / (30 * 86400000));
  const avgPerSellerMonth = totalSellers ? (totalOrders ?? 0) / totalSellers / months : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading">Analytics</h1>
        <p className="mt-1 text-body text-porter-text-secondary">Platform charts (recharts).</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total sellers" value={totalSellers ?? 0} />
        <StatCard label="Total orders" value={totalOrders ?? 0} />
        <StatCard label="Total revenue" value={Math.round(totalRev).toLocaleString("en-IN")} prefix="₹" />
        <StatCard label="Avg orders / seller / month" value={avgPerSellerMonth.toFixed(1)} />
        <StatCard label="Top city (30d)" value={topCity} />
        <StatCard label="Popular payment (30d)" value={popularPay} />
      </div>
      <Card padding="md">
        <AdminAnalyticsClient dailyOrders={dailyOrders} revenueTop={revenueTop} paySplit={paySplit} signups={signupsSeries} />
      </Card>
    </div>
  );
}
