import { waitUntil } from "@vercel/functions";
import { appendConversationMessage, normalizeCustomerPhone } from "@/lib/conversation-messages";
import { getSellerByOpenWASessionId, handleIncomingCustomerMessage } from "@/lib/conversation";
import { openWAChatIdToPhone, verifyOpenWAWebhookSignature } from "@/lib/openwa-client";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

type OpenWAWebhookPayload = {
  event?: string;
  sessionId?: string;
  data?: { from?: string; body?: string; isGroup?: boolean };
};

export async function POST(req: Request) {
  const rawBody = await req.text();
  let payload: OpenWAWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as OpenWAWebhookPayload;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const secret = process.env.OPENWA_WEBHOOK_SECRET ?? "";
  if (secret && !verifyOpenWAWebhookSignature(rawBody, req.headers.get("x-openwa-signature"), secret)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (payload.event !== "message.received" || payload.data?.isGroup) {
    return new Response("OK", { status: 200 });
  }

  const sessionId = payload.sessionId;
  const fromChat = payload.data?.from;
  const messageBody = payload.data?.body;
  if (!sessionId || !fromChat || !messageBody) return new Response("OK", { status: 200 });

  waitUntil(
    (async () => {
      const seller = await getSellerByOpenWASessionId(sessionId);
      if (!seller) return;
      const phone = normalizeCustomerPhone(openWAChatIdToPhone(fromChat));
      const supabase = createSupabaseServiceRoleClient();
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("seller_id", seller.id)
        .eq("customer_phone", phone)
        .maybeSingle();
      const fromDigits = fromChat.split("@")[0] ?? "";
      await handleIncomingCustomerMessage(seller, fromDigits, messageBody, { isFirstMessage: !conv });
      const { data: convAfter } = await supabase
        .from("conversations")
        .select("id")
        .eq("seller_id", seller.id)
        .eq("customer_phone", phone)
        .maybeSingle();
      if (convAfter?.id) {
        await appendConversationMessage(supabase, {
          sellerId: seller.id,
          conversationId: convAfter.id,
          direction: "in",
          body: messageBody,
        });
      }
    })()
  );

  return new Response("OK", { status: 200 });
}
