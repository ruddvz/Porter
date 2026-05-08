import { appendConversationMessage } from "@/lib/conversation-messages";
import { sendMessage } from "@/lib/meta-whatsapp";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  conversationId?: string;
  message?: string;
};

/** POST — seller sends a manual WhatsApp text (Plan0 §7). Body: { conversationId, message }. */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized", code: "401" } }, { status: 401 });

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return NextResponse.json({ data: null, error: { message: "No seller profile", code: "400" } }, { status: 400 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ data: null, error: { message: "Invalid JSON", code: "400" } }, { status: 400 });
  }

  const conversationId = body.conversationId?.trim();
  const message = body.message?.trim();
  if (!conversationId || !message) {
    return NextResponse.json(
      { data: null, error: { message: "conversationId and message are required", code: "400" } },
      { status: 400 }
    );
  }

  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id, seller_id, customer_phone")
    .eq("id", conversationId)
    .eq("seller_id", seller.id)
    .maybeSingle();

  if (convErr || !conv) {
    return NextResponse.json({ data: null, error: { message: "Conversation not found", code: "404" } }, { status: 404 });
  }

  const ok = await sendMessage(conv.customer_phone, message, seller);
  if (!ok) {
    return NextResponse.json(
      { data: null, error: { message: "Meta API did not accept the message (check WhatsApp credentials)", code: "502" } },
      { status: 502 }
    );
  }

  const logged = await appendConversationMessage(supabase, {
    sellerId: seller.id,
    conversationId: conv.id,
    direction: "out",
    body: message,
  });
  if (!logged.ok) {
    console.error("[wa/send] message sent but log failed", logged.error);
  }

  return NextResponse.json({ data: { ok: true }, error: null });
}
