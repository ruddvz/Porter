import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { checkGate } from "@/lib/plan-gates";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SubBody = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return NextResponse.json({ error: "No seller" }, { status: 400 });

  const gate = checkGate(seller, "push_notifications");
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  let sub: SubBody;
  try {
    sub = (await req.json()) as SubBody;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const svc = createSupabaseServiceRoleClient();
  const { error } = await svc.from("seller_push_subscriptions").upsert(
    {
      seller_id: seller.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    { onConflict: "seller_id,endpoint" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
