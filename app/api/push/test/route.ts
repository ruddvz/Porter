import { apiErr, apiOk } from "@/lib/api-json";
import { checkGate } from "@/lib/plan-gates";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/** Authenticated seller: send a test push to this store's subscriptions. */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller", 400);

  const gate = checkGate(seller, "push_notifications");
  if (!gate.ok) return apiErr(gate.reason, 403, "403");

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const secret = process.env.PUSH_INTERNAL_SECRET;
  if (!base || !secret) return apiErr("Push not configured", 503, "503");

  const res = await fetch(`${base}/api/push/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-porter-push-secret": secret,
    },
    body: JSON.stringify({
      seller_id: seller.id,
      title: "Porter test",
      body: "Push notifications are working on this device.",
    }),
  });

  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    return apiErr(j.error?.message ?? "Test send failed", res.status);
  }

  return apiOk({ ok: true });
}
