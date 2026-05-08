import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { encryptOptional } from "@/lib/field-crypto";

export const runtime = "nodejs";

/** Encrypt UPI / Razorpay keys at rest (requires PORTER_CREDENTIAL_SECRET on server). */
export async function POST(req: Request) {
  const secret = process.env.PORTER_CREDENTIAL_SECRET;
  if (!secret?.trim()) {
    return apiErr("PORTER_CREDENTIAL_SECRET not configured", 503, "503");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  let body: { upi?: string; razorpay_key_id?: string; razorpay_key_secret?: string; meta_access_token?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Bad JSON", 400);
  }

  const admin = createSupabaseServiceRoleClient();
  const { data: seller } = await admin.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller", 400);

  const payload: Record<string, unknown> = {};
  if (body.upi !== undefined) {
    payload.upi_id_enc = encryptOptional(body.upi || null, secret);
    payload.upi_id = null;
  }
  if (body.razorpay_key_id !== undefined) {
    payload.razorpay_key_id_enc = encryptOptional(body.razorpay_key_id || null, secret);
    payload.razorpay_key_id = null;
  }
  if (body.razorpay_key_secret !== undefined) {
    payload.razorpay_key_secret_enc = encryptOptional(body.razorpay_key_secret || null, secret);
    payload.razorpay_key_secret = null;
  }
  if (body.meta_access_token !== undefined) {
    payload.meta_access_token_enc = encryptOptional(body.meta_access_token || null, secret);
    payload.meta_access_token = null;
  }

  const { error } = await admin.from("sellers").update(payload).eq("id", seller.id);
  if (error) return apiErr(error.message, 500);
  return apiOk({ ok: true });
}
