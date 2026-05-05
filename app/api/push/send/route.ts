import webpush from "web-push";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function configureWebPush() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails("mailto:support@porter.app", pub, priv);
  return true;
}

/** Internal: send Web Push to all subscriptions for a seller (new order / payment). */
export async function POST(req: Request) {
  const secret = process.env.PUSH_INTERNAL_SECRET;
  if (!secret || req.headers.get("x-porter-push-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!configureWebPush()) {
    return NextResponse.json({ error: "VAPID not configured" }, { status: 503 });
  }

  let body: { seller_id?: string; title?: string; body?: string; admin_broadcast?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const supabase = createSupabaseServiceRoleClient();

  if (body.admin_broadcast) {
    const { data: subs } = await supabase.from("admin_push_subscriptions").select("endpoint, p256dh, auth");
    let sent = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: body.title ?? "Porter", body: body.body ?? "", url: "/admin" })
        );
        sent++;
      } catch (e) {
        console.error("[push send] admin", e);
      }
    }
    return NextResponse.json({ sent });
  }

  const sellerId = body.seller_id;
  if (!sellerId) return NextResponse.json({ error: "seller_id required" }, { status: 400 });

  const { data: subs } = await supabase
    .from("seller_push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("seller_id", sellerId);

  let sent = 0;
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({
          title: body.title ?? "Porter",
          body: body.body ?? "",
          url: "/dashboard/orders",
        })
      );
      sent++;
    } catch (e) {
      console.error("[push send] seller", e);
    }
  }
  return NextResponse.json({ sent });
}
