import type { SupabaseClient } from "@supabase/supabase-js";

export type WebhookProvider = "razorpay" | "whatsapp_meta" | "openwa";

/**
 * Returns true if this event was newly recorded and should be processed.
 * Returns false if duplicate (already processed).
 */
export async function claimWebhookEvent(
  supabase: SupabaseClient,
  provider: WebhookProvider,
  externalEventId: string,
): Promise<boolean> {
  const id = `${provider}:${externalEventId}`;
  const { error } = await supabase.from("webhook_events").insert({
    id,
    provider,
    external_event_id: externalEventId,
  });
  if (!error) return true;
  if (error.code === "23505") return false;
  // Migration not applied yet — process webhook (logged once per deploy)
  if (error.code === "42P01") {
    console.warn("[webhook-idempotency] webhook_events table missing; apply migration 018");
    return true;
  }
  console.error("[webhook-idempotency] insert", error);
  return true;
}
