import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type PlatformEventRow = {
  id: string;
  created_at: string;
  event_type: string;
  notes: string | null;
  admin_id: string | null;
  target_seller_id: string | null;
};

export async function fetchRecentPlatformEvents(limit = 50): Promise<PlatformEventRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("platform_events")
    .select("id,created_at,event_type,notes,admin_id,target_seller_id")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[fetchRecentPlatformEvents]", error);
    return [];
  }
  return (data ?? []) as PlatformEventRow[];
}
