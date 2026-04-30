import OrderHistoryClient from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function OrderHistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false })
    .limit(500);

  return <OrderHistoryClient initialOrders={orders ?? []} />;
}
