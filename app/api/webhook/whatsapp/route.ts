import { waitUntil } from "@vercel/functions";
import { appendConversationMessage, normalizeCustomerPhone } from "@/lib/conversation-messages";
import { getSellerByMetaPhoneNumberId, handleIncomingCustomerMessage } from "@/lib/conversation";
import {
  requireMetaWebhookSignatureInProduction,
  verifyMetaWebhookSignature,
} from "@/lib/meta-webhook-signature";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { claimWebhookEvent } from "@/lib/webhook-idempotency";
import type { MetaWebhookPayload } from "@/types";

export const runtime = "nodejs";

/** Meta WhatsApp Cloud API webhook: GET verifies subscription, POST receives messages. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verify = process.env.META_WEBHOOK_VERIFY_TOKEN ?? process.env.META_VERIFY_TOKEN;
  if (mode === "subscribe" && token && verify && token === verify && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const appSecret = process.env.META_APP_SECRET;
  const sig = req.headers.get("x-hub-signature-256");

  if (requireMetaWebhookSignatureInProduction()) {
    if (!appSecret) {
      console.error("[whatsapp-webhook] META_APP_SECRET missing in production");
      return new Response("Server misconfigured", { status: 500 });
    }
    if (!verifyMetaWebhookSignature(rawBody, sig, appSecret)) {
      return new Response("Invalid signature", { status: 401 });
    }
  } else if (appSecret && sig && !verifyMetaWebhookSignature(rawBody, sig, appSecret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const entry = payload.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const phoneNumberId = value?.metadata?.phone_number_id;
  const msg = value?.messages?.[0];
  const from = msg?.from;
  const body = msg?.type === "text" ? msg.text?.body : undefined;

  if (!phoneNumberId || !from || !body) {
    return new Response("OK", { status: 200 });
  }

  const messageId = msg.id ?? `${phoneNumberId}:${from}:${msg.timestamp ?? Date.now()}`;
  const supabase = createSupabaseServiceRoleClient();
  const shouldProcess = await claimWebhookEvent(supabase, "whatsapp_meta", messageId);
  if (!shouldProcess) {
    return new Response("OK", { status: 200 });
  }

  waitUntil(
    (async () => {
      const seller = await getSellerByMetaPhoneNumberId(phoneNumberId);
      if (!seller) {
        console.error("[whatsapp-webhook] No seller for phone_number_id", phoneNumberId);
        return;
      }
      const phone = normalizeCustomerPhone(from);
      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", seller.id)
        .eq("customer_phone", phone);
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("seller_id", seller.id)
        .eq("customer_phone", phone)
        .maybeSingle();
      const isFirstMessage = (orderCount ?? 0) === 0 && !existingConv;
      await handleIncomingCustomerMessage(seller, from, body, { isFirstMessage });
      const { data: convAfter } = await supabase
        .from("conversations")
        .select("id")
        .eq("seller_id", seller.id)
        .eq("customer_phone", phone)
        .maybeSingle();
      if (convAfter?.id) {
        const logged = await appendConversationMessage(supabase, {
          sellerId: seller.id,
          conversationId: convAfter.id,
          direction: "in",
          body,
        });
        if (!logged.ok) console.error("[whatsapp-webhook] conversation_messages insert", logged.error);
      }
    })()
  );

  return new Response("OK", { status: 200 });
}
