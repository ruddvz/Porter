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

  return <SettingsClient seller={seller} />;
}
