import LiveOrdersBoard from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  LIVE_BOARD_FETCH_LIMIT,
  LIVE_BOARD_RECENT_TERMINAL_DAYS,
  LIVE_BOARD_STATUSES,
} from "@/lib/dashboard-orders-query";
import { buildSetupChecklist, filterLowStockProducts } from "@/lib/setup-checklist";
import { redirect } from "next/navigation";

export default async function DashboardHome() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const terminalSince = new Date();
  terminalSince.setDate(terminalSince.getDate() - LIVE_BOARD_RECENT_TERMINAL_DAYS);
  const terminalSinceIso = terminalSince.toISOString();

  const [{ data: activeOrders }, { data: recentTerminal }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("seller_id", seller.id)
      .in("status", LIVE_BOARD_STATUSES)
      .order("created_at", { ascending: false })
      .limit(LIVE_BOARD_FETCH_LIMIT),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("seller_id", seller.id)
      .in("status", ["delivered", "cancelled"])
      .gte("created_at", terminalSinceIso)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const merged = [...(activeOrders ?? []), ...(recentTerminal ?? [])];
  const seen = new Set<string>();
  const orders = merged
    .filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, LIVE_BOARD_FETCH_LIMIT);

  const { data: products } = await supabase.from("products").select("*").eq("seller_id", seller.id);

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id);

  const whatsappConnected =
    seller.whatsapp_provider === "openwa"
      ? Boolean(seller.openwa_session_id && seller.openwa_session_status === "CONNECTED")
      : Boolean(seller.meta_phone_number_id);

  const setupChecklist = buildSetupChecklist({
    seller,
    productCount: products?.length ?? 0,
    orderCount: orderCount ?? 0,
    hasZones: (seller.delivery_zones?.length ?? 0) > 0,
    whatsappConnected,
  });

  const lowStock = filterLowStockProducts(products ?? []);

  return (
    <LiveOrdersBoard
      seller={seller}
      initialOrders={orders ?? []}
      lowStockProducts={lowStock}
      setupChecklist={setupChecklist}
    />
  );
}
