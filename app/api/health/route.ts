import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function envPresent(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0;
}

/** Lightweight readiness check for load balancers / uptime monitors. */
export async function GET() {
  const config = {
    supabaseUrl: envPresent("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnon: envPresent("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRole: envPresent("SUPABASE_SERVICE_ROLE_KEY"),
    appUrl: envPresent("NEXT_PUBLIC_APP_URL"),
    razorpayWebhook: envPresent("RAZORPAY_WEBHOOK_SECRET"),
    metaAppSecret: envPresent("META_APP_SECRET"),
    impersonation: envPresent("PORTER_IMPERSONATION_SECRET"),
  };

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase.from("sellers").select("id", { count: "exact", head: true }).limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, config }, { status: 503 });
    }
    return NextResponse.json({ ok: true, config });
  } catch (e) {
    console.error("[health]", e);
    return NextResponse.json({ ok: false, error: "unhealthy", config }, { status: 503 });
  }
}
