import webpush from "web-push";
import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

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
    return apiErr("Unauthorized", 401, "401");
  }
  if (!configureWebPush()) {
    return apiErr("VAPID not configured", 503, "503");
  }

  let body: { seller_id?: string; title?: string; body?: string; admin_broadcast?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Bad JSON", 400);
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
    return apiOk({ sent });
  }

  const sellerId = body.seller_id;
  if (!sellerId) return apiErr("seller_id required", 400);

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
  return apiOk({ sent });
}
