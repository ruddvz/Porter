import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: seller } = await supabase.from("sellers").select("plan").eq("user_id", user.id).maybeSingle();

  return NextResponse.json({
    mode: "manual",
    message:
      "Subscription upgrades are handled manually for now. Contact Porter support or use the Growth upgrade flow when available.",
    plan: seller?.plan ?? "starter",
  });
}
