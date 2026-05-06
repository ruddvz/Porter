import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** After onboarding creates a seller, notify admins (Web Push). Auth: must own seller row. */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { seller_id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
  const sellerId = body.seller_id;
  if (!sellerId) return NextResponse.json({ error: "seller_id required" }, { status: 400 });

  const { data: row } = await supabase.from("sellers").select("id, store_name").eq("id", sellerId).eq("user_id", user.id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const secret = process.env.PUSH_INTERNAL_SECRET;
  if (base && secret) {
    try {
      await fetch(`${base}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-porter-push-secret": secret },
        body: JSON.stringify({
          admin_broadcast: true,
          title: "New seller signup",
          body: row.store_name,
        }),
      });
    } catch (e) {
      console.error("[after-seller-created] push", e);
    }
  }

  const admin = createSupabaseAdminClient();
  await admin.from("platform_events").insert({
    event_type: "seller.signup",
    target_seller_id: sellerId,
    notes: row.store_name,
  });

  return NextResponse.json({ ok: true });
}
