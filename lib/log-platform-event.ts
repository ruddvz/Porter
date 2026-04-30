import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/** Append a row to platform_events (service role only). */
export async function logPlatformEvent(params: {
  adminUserId: string;
  eventType: string;
  targetSellerId?: string | null;
  notes?: string | null;
}): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    const { data: row } = await admin.from("admin_users").select("id").eq("user_id", params.adminUserId).maybeSingle();
    if (!row?.id) return;
    const { error } = await admin.from("platform_events").insert({
      admin_id: row.id as string,
      event_type: params.eventType,
      target_seller_id: params.targetSellerId ?? null,
      notes: params.notes ?? null,
    });
    if (error) console.error("[platform_events]", error);
  } catch (e) {
    console.error("[platform_events]", e);
  }
}
