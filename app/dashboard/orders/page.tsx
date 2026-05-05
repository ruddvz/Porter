import OrderHistoryClient from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

const PAGE_SIZE = 20;

export default async function OrderHistoryPage() {
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
    .range(0, PAGE_SIZE - 1);

  return <OrderHistoryClient seller={seller} initialOrders={orders ?? []} pageSize={PAGE_SIZE} />;
}
