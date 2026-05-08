import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/**
 * Billing stub: Porter SaaS billing is not wired to Razorpay Subscriptions yet.
 * Returns plan info so the dashboard can show honest messaging.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  const { data: seller } = await supabase.from("sellers").select("plan").eq("user_id", user.id).maybeSingle();

  return apiOk({
    mode: "manual" as const,
    message:
      "Subscription upgrades are handled manually for now. Contact Porter support or use the Growth upgrade flow when available.",
    plan: seller?.plan ?? "starter",
  });
}
