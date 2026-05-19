import LiveOrdersBoard from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
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

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false })
    .limit(200);

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
