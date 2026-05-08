import { sendMessage } from "@/lib/meta-whatsapp";
import { apiErr, apiOk } from "@/lib/api-json";
import { checkGate } from "@/lib/plan-gates";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const BATCH = 40;

/** Broadcast a WhatsApp message to unique customers who have ordered from this seller. */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller", 400);

  const gate = checkGate(seller, "whatsapp_broadcast");
  if (!gate.ok) return apiErr(gate.reason, 403, "403");

  let body: { message?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Bad JSON", 400);
  }

  const message = body.message?.trim();
  if (!message || message.length > 4096) {
    return apiErr("Message required (max 4096 chars)", 400);
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("phone_number")
    .eq("seller_id", seller.id);

  const phones = Array.from(new Set((customers ?? []).map((c) => String(c.phone_number)).filter(Boolean)));
  let sent = 0;
  for (let i = 0; i < phones.length; i += BATCH) {
    const chunk = phones.slice(i, i + BATCH);
    await Promise.all(
      chunk.map(async (phone) => {
        const ok = await sendMessage(phone, message, seller);
        if (ok) sent += 1;
      })
    );
  }

  await supabase.from("broadcast_messages").insert({
    seller_id: seller.id,
    body: message,
    recipient_count: sent,
  });

  return apiOk({ ok: true, attempted: phones.length, sent });
}
