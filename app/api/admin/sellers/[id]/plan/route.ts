import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: adminRow } = await admin.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: { plan?: string };
  try {
    body = (await req.json()) as { plan?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const plan = body.plan;
  if (plan !== "starter" && plan !== "growth") {
    return NextResponse.json({ error: "plan must be starter or growth" }, { status: 400 });
  }

  const sellerId = params.id;
  const { data: before } = await admin.from("sellers").select("plan").eq("id", sellerId).maybeSingle();
  const { error } = await admin.from("sellers").update({ plan }).eq("id", sellerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logPlatformEvent } = await import("@/lib/log-platform-event");
  await logPlatformEvent({
    adminUserId: user.id,
    eventType: "plan_changed",
    targetSellerId: sellerId,
    notes: `from ${(before as { plan?: string } | null)?.plan ?? "?"} to ${plan}`,
  });

  return NextResponse.json({ ok: true });
}
