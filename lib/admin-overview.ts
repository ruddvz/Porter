import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type AdminOverview = {
  totalSellersActive: number;
  newSellersThisMonth: number;
  ordersToday: number;
  revenueToday: number;
  activeConversations: number;
  failedOrStaleToday: number;
  topSellersToday: Array<{ seller_id: string; store_name: string; city: string | null; orders: number; revenue: number; plan: string }>;
  recentEvents: Array<{ id: string; created_at: string; event_type: string; notes: string | null; admin_email: string | null; target_seller_id: string | null }>;
};

function startOfMonth(d = new Date()) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const supabase = createSupabaseAdminClient();
  const day0 = startOfDay().toISOString();
  const month0 = startOfMonth().toISOString();
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

  const { count: totalSellersActive } = await supabase
    .from("sellers")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { count: newSellersThisMonth } = await supabase
    .from("sellers")
    .select("*", { count: "exact", head: true })
    .gte("created_at", month0);

  const { count: ordersToday } = await supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", day0);

  const { data: paidToday } = await supabase
    .from("orders")
    .select("total_amount")
    .gte("created_at", day0)
    .in("payment_status", ["paid", "cod_collected"]);

  const revenueToday = (paidToday ?? []).reduce((s, r) => s + Number(r.total_amount ?? 0), 0);

  const { count: activeConversations } = await supabase
    .from("conversations")
    .select("*", { count: "exact", head: true })
    .not("state", "in", "(complete,failed)");

  const { data: convStale } = await supabase
    .from("conversations")
    .select("id,state,last_message_at")
    .gte("created_at", day0);

  const failedOrStaleToday =
    (convStale ?? []).filter((c) => {
      if (c.state === "failed") return true;
      if (c.state === "complete") return false;
      if (!c.last_message_at) return false;
      return new Date(c.last_message_at) < new Date(staleBefore);
    }).length ?? 0;

  const { data: ordersAgg } = await supabase
    .from("orders")
    .select("seller_id,total_amount,payment_status,sellers(store_name,city,plan)")
    .gte("created_at", day0)
    .neq("status", "cancelled");

  const bySeller = new Map<string, { orders: number; revenue: number; store_name: string; city: string | null; plan: string }>();
  for (const row of ordersAgg ?? []) {
    const sid = row.seller_id as string;
    const store = row.sellers as { store_name?: string; city?: string | null; plan?: string } | null;
    const prev = bySeller.get(sid) ?? {
      orders: 0,
      revenue: 0,
      store_name: store?.store_name ?? "—",
      city: store?.city ?? null,
      plan: store?.plan ?? "starter",
    };
    prev.orders += 1;
    if (row.payment_status === "paid" || row.payment_status === "cod_collected") {
      prev.revenue += Number(row.total_amount ?? 0);
    }
    bySeller.set(sid, prev);
  }

  const topSellersToday = Array.from(bySeller.entries())
    .map(([seller_id, v]) => ({ seller_id, ...v }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10);

  const { data: events } = await supabase
    .from("platform_events")
    .select("id,created_at,event_type,notes,admin_id,target_seller_id")
    .order("created_at", { ascending: false })
    .limit(20);

  const adminIds = Array.from(new Set((events ?? []).map((e) => e.admin_id).filter(Boolean))) as string[];
  let adminEmailById: Record<string, string> = {};
  if (adminIds.length) {
    const { data: admins } = await supabase.from("admin_users").select("id,email").in("id", adminIds);
    adminEmailById = Object.fromEntries((admins ?? []).map((a) => [a.id as string, a.email as string]));
  }

  const recentEvents =
    (events ?? []).map((e) => ({
      id: e.id as string,
      created_at: e.created_at as string,
      event_type: e.event_type as string,
      notes: (e.notes as string | null) ?? null,
      admin_email: e.admin_id ? adminEmailById[e.admin_id as string] ?? null : null,
      target_seller_id: (e.target_seller_id as string | null) ?? null,
    })) ?? [];

  return {
    totalSellersActive: totalSellersActive ?? 0,
    newSellersThisMonth: newSellersThisMonth ?? 0,
    ordersToday: ordersToday ?? 0,
    revenueToday,
    activeConversations: activeConversations ?? 0,
    failedOrStaleToday,
    topSellersToday,
    recentEvents,
  };
}
