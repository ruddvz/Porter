import AnalyticsClient from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { analyticsHistoryCutoffIso } from "@/lib/plan-gates";
import { accumulateMtdVersusPriorMonth } from "@/lib/month-compare";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const since = analyticsHistoryCutoffIso(seller);

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("seller_id", seller.id)
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  const { data: products } = await supabase.from("products").select("id").eq("seller_id", seller.id);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count: todayOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id)
    .gte("created_at", startOfDay.toISOString());

  const { data: todayRows } = await supabase
    .from("orders")
    .select("total_amount, payment_status")
    .eq("seller_id", seller.id)
    .gte("created_at", startOfDay.toISOString());

  let todayRevenue = 0;
  for (const o of todayRows ?? []) {
    if (o.payment_status === "paid" || o.payment_status === "cod_collected") {
      todayRevenue += Number(o.total_amount ?? 0);
    }
  }

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id)
    .eq("status", "pending");

  const { count: customerCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id);

  const prevMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const { data: mtdCompareRows } = await supabase
    .from("orders")
    .select("created_at,total_amount,payment_status")
    .eq("seller_id", seller.id)
    .gte("created_at", prevMonthStart.toISOString());

  const mtdVersusPrior = accumulateMtdVersusPriorMonth(mtdCompareRows ?? []);

  return (
    <AnalyticsClient
      seller={seller}
      initialOrders={orders ?? []}
      stats={{
        todayOrders: todayOrders ?? 0,
        todayRevenue,
        pendingOrders: pendingCount ?? 0,
        totalCustomers: customerCount ?? 0,
        productCount: products?.length ?? 0,
      }}
      periodCompare={{
        labelCurrent: "Month to date",
        labelPrevious: "Same calendar span last month",
        currentOrders: mtdVersusPrior.mtdOrderCount,
        currentRevenue: mtdVersusPrior.mtdRevenue,
        previousOrders: mtdVersusPrior.prevPeriodOrderCount,
        previousRevenue: mtdVersusPrior.prevPeriodRevenue,
      }}
    />
  );
}
