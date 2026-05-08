import ConversationsClient from "./ConversationsClient";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ConversationListRow } from "@/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) redirect("/onboarding");

  const { data: convs, error } = await supabase
    .from("conversations")
    .select("id, customer_phone, state, last_message_at, created_at")
    .eq("seller_id", seller.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[conversations/page]", error);
  }

  const list = (convs ?? []) as Pick<ConversationListRow, "id" | "customer_phone" | "state" | "last_message_at">[];
  const phones = Array.from(new Set(list.map((c) => c.customer_phone)));
  let nameByPhone = new Map<string, string | null>();
  if (phones.length > 0) {
    const { data: custs } = await supabase
      .from("customers")
      .select("phone_number, name")
      .eq("seller_id", seller.id)
      .in("phone_number", phones);
    nameByPhone = new Map((custs ?? []).map((r) => [r.phone_number as string, r.name]));
  }

  const rows: ConversationListRow[] = list.map((c) => ({
    ...c,
    customer_name: nameByPhone.get(c.customer_phone) ?? null,
  }));

  return <ConversationsClient seller={seller} initialRows={rows} />;
}
