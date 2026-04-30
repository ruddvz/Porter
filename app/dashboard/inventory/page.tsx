import InventoryClient from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function InventoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  return <InventoryClient initialProducts={products ?? []} />;
}
