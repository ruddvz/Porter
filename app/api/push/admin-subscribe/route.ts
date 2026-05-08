import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return apiErr("Forbidden", 403, "403");

  const { data: adminRow } = await supabase.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return apiErr("No admin row", 400);

  let sub: { endpoint: string; keys: { p256dh: string; auth: string } };
  try {
    sub = (await req.json()) as typeof sub;
  } catch {
    return apiErr("Bad JSON", 400);
  }
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return apiErr("Invalid subscription", 400);
  }

  const svc = createSupabaseServiceRoleClient();
  const { error } = await svc.from("admin_push_subscriptions").upsert(
    {
      admin_user_id: adminRow.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "admin_user_id,endpoint" }
  );

  if (error) return apiErr(error.message, 500);
  return apiOk({ subscribed: true });
}
