import ConversationsClient from "./ui";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Conversation } from "@/types";
import { redirect } from "next/navigation";

export default async function ConversationsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const { data: rows } = await supabase
    .from("conversations")
    .select("*")
    .eq("seller_id", seller.id)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(200);

  return <ConversationsClient initialConversations={(rows ?? []) as Conversation[]} />;
}
