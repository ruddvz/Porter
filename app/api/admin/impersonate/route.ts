import { apiErr, apiOk } from "@/lib/api-json";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  let body: { sellerId?: string };
  try {
    body = (await req.json()) as { sellerId?: string };
  } catch {
    return apiErr("Invalid JSON", 400);
  }
  const sellerId = body.sellerId?.trim();
  if (!sellerId) return apiErr("sellerId required", 400);

  const admin = createSupabaseAdminClient();
  const { data: adminRow } = await admin.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return apiErr("Forbidden", 403, "403");

  const { data: seller } = await admin.from("sellers").select("id").eq("id", sellerId).maybeSingle();
  if (!seller) return apiErr("Seller not found", 404, "404");

  const cookieStore = await cookies();
  cookieStore.set("porter_admin_impersonate", sellerId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 4,
  });

  const { logPlatformEvent } = await import("@/lib/log-platform-event");
  await logPlatformEvent({
    adminUserId: user.id,
    eventType: "impersonate_start",
    targetSellerId: sellerId,
    notes: null,
  });

  return apiOk({ ok: true });
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  const admin = createSupabaseAdminClient();
  const { data: adminRow } = await admin.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
  if (!adminRow) return apiErr("Forbidden", 403, "403");

  const cookieStore = await cookies();
  cookieStore.delete("porter_admin_impersonate");

  const { logPlatformEvent } = await import("@/lib/log-platform-event");
  await logPlatformEvent({
    adminUserId: user.id,
    eventType: "impersonate_end",
    targetSellerId: null,
    notes: null,
  });

  return apiOk({ ok: true });
}
