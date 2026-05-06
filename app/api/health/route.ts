import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Lightweight readiness check for load balancers / uptime monitors. */
export async function GET() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase.from("sellers").select("id", { count: "exact", head: true }).limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[health]", e);
    return NextResponse.json({ ok: false, error: "unhealthy" }, { status: 503 });
  }
}
