import { apiErr, apiOk } from "@/lib/api-json";
import {
  createOpenWASession,
  getOpenWAQr,
  getOpenWASession,
  isOpenWAConfigured,
  registerOpenWAWebhook,
  startOpenWASession,
} from "@/lib/openwa-client";
import { slugifyStoreName } from "@/lib/store-slug";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/** GET — OpenWA session status + QR. POST — create/connect session. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  if (!isOpenWAConfigured()) return apiErr("OpenWA is not configured on the server", 503, "OPENWA_NOT_CONFIGURED");

  const sessionId = seller.openwa_session_id;
  if (!sessionId) {
    return apiOk({ connected: false, provider: seller.whatsapp_provider ?? "meta", session: null, qr: null });
  }

  const sessionRes = await getOpenWASession(sessionId);
  const qrRes = await getOpenWAQr(sessionId);
  return apiOk({
    connected: sessionRes.ok && sessionRes.session.status === "CONNECTED",
    provider: seller.whatsapp_provider,
    session: sessionRes.ok ? sessionRes.session : null,
    qr: qrRes.ok ? qrRes.qr : null,
  });
}

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);
  if (!isOpenWAConfigured()) return apiErr("OpenWA is not configured", 503);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const webhookSecret = process.env.OPENWA_WEBHOOK_SECRET ?? "porter-openwa";
  const sessionName = `porter-${seller.store_slug ?? slugifyStoreName(seller.store_name)}-${seller.id.slice(0, 8)}`;

  let sessionId = seller.openwa_session_id;
  if (!sessionId) {
    const created = await createOpenWASession(sessionName);
    if (!created.ok) return apiErr(created.message, 502);
    sessionId = created.session.id;
    await supabase
      .from("sellers")
      .update({
        openwa_session_id: sessionId,
        openwa_session_status: created.session.status,
        whatsapp_provider: "openwa",
      })
      .eq("id", seller.id);
  }

  await startOpenWASession(sessionId);
  if (appUrl) {
    await registerOpenWAWebhook(sessionId, `${appUrl}/api/webhook/openwa`, webhookSecret);
  }

  const qrRes = await getOpenWAQr(sessionId);
  const sessionRes = await getOpenWASession(sessionId);
  if (sessionRes.ok) {
    await supabase
      .from("sellers")
      .update({ openwa_session_status: sessionRes.session.status })
      .eq("id", seller.id);
  }

  return apiOk({
    sessionId,
    session: sessionRes.ok ? sessionRes.session : null,
    qr: qrRes.ok ? qrRes.qr : null,
    webhookUrl: appUrl ? `${appUrl}/api/webhook/openwa` : null,
  });
}
