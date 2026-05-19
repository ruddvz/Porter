import CategoriesClient from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("seller_id", seller.id)
    .order("sort_order")
    .order("name");

  void seller;
  return <CategoriesClient initialCategories={categories ?? []} />;
}
