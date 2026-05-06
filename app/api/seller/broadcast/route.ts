import { sendMessage } from "@/lib/meta-whatsapp";
import { checkGate } from "@/lib/plan-gates";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BATCH = 40;

/** Broadcast a WhatsApp message to unique customers who have ordered from this seller. */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return NextResponse.json({ error: "No seller" }, { status: 400 });

  const gate = checkGate(seller, "whatsapp_broadcast");
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });

  let body: { message?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message || message.length > 4096) {
    return NextResponse.json({ error: "Message required (max 4096 chars)" }, { status: 400 });
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

  return NextResponse.json({ ok: true, attempted: phones.length, sent });
}
