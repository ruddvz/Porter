import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: adminRow } = await supabase.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "No admin row" }, { status: 400 });

  let sub: { endpoint: string; keys: { p256dh: string; auth: string } };
  try {
    sub = (await req.json()) as typeof sub;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
