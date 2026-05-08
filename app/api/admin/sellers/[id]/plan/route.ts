import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  const admin = createSupabaseAdminClient();
  const { data: adminRow } = await admin.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return apiErr("Forbidden", 403, "403");

  let body: { plan?: string };
  try {
    body = (await req.json()) as { plan?: string };
  } catch {
    return apiErr("Invalid JSON", 400);
  }
  const plan = body.plan;
  if (plan !== "starter" && plan !== "growth") {
    return apiErr("plan must be starter or growth", 400);
  }

  const sellerId = params.id;
  const { data: before } = await admin.from("sellers").select("plan").eq("id", sellerId).maybeSingle();
  const { error } = await admin.from("sellers").update({ plan }).eq("id", sellerId);
  if (error) return apiErr(error.message, 500);

  const { logPlatformEvent } = await import("@/lib/log-platform-event");
  await logPlatformEvent({
    adminUserId: user.id,
    eventType: "plan_changed",
    targetSellerId: sellerId,
    notes: `from ${(before as { plan?: string } | null)?.plan ?? "?"} to ${plan}`,
  });

  return apiOk({ ok: true });
}
