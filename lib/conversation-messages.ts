import type { SupabaseClient } from "@supabase/supabase-js";

/** Normalize to E.164-style +digits for storage keys (matches webhook). */
export function normalizeCustomerPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (raw.trim().startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

export async function appendConversationMessage(
  supabase: SupabaseClient,
  params: {
    sellerId: string;
    conversationId: string;
    direction: "in" | "out";
    body: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("conversation_messages").insert({
    seller_id: params.sellerId,
    conversation_id: params.conversationId,
    direction: params.direction,
    body: params.body,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
