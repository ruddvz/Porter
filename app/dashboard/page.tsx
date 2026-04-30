import LiveOrdersBoard from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
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

  return <LiveOrdersBoard seller={seller} initialOrders={orders ?? []} />;
}
