import SettingsClient from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count: ordersThisMonth } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id)
    .gte("created_at", startOfMonth.toISOString());

  return <SettingsClient seller={seller} ordersThisMonth={ordersThisMonth ?? 0} />;
}
