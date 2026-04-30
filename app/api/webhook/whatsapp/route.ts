import { waitUntil } from "@vercel/functions";
import { getSellerByMetaPhoneNumberId, handleIncomingCustomerMessage } from "@/lib/conversation";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { MetaWebhookPayload } from "@/types";

export const runtime = "nodejs";

function normalizeWaPhone(from: string): string {
  const digits = from.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (from.startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

/** Meta WhatsApp Cloud API webhook: GET verifies subscription, POST receives messages. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verify = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (mode === "subscribe" && token && verify && token === verify && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  let payload: MetaWebhookPayload;
  try {
    payload = (await req.json()) as MetaWebhookPayload;
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

  waitUntil(
    (async () => {
      const seller = await getSellerByMetaPhoneNumberId(phoneNumberId);
      if (!seller) {
        console.error("[whatsapp-webhook] No seller for phone_number_id", phoneNumberId);
        return;
      }
      const phone = normalizeWaPhone(from);
      const supabase = createSupabaseServiceRoleClient();
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
    })()
  );

  return new Response("OK", { status: 200 });
}
