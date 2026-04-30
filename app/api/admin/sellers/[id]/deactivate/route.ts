import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data: adminRow } = await admin.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sellerId = params.id;
  const { error } = await admin.from("sellers").update({ is_active: false }).eq("id", sellerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { logPlatformEvent } = await import("@/lib/log-platform-event");
  await logPlatformEvent({
    adminUserId: user.id,
    eventType: "seller_deactivated",
    targetSellerId: sellerId,
    notes: null,
  });

  return NextResponse.json({ ok: true });
}
