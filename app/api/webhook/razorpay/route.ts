import { createHmac, timingSafeEqual } from "crypto";
import { waitUntil } from "@vercel/functions";
import { insertOrderEvent } from "@/lib/order-events";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { sendMessage } from "@/lib/whatsapp";

export const runtime = "nodejs";

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function normalizePhone(p: string): string {
  const digits = p.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (p.startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

async function notifyOrderPush(sellerId: string, title: string, body: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const secret = process.env.PUSH_INTERNAL_SECRET;
  if (!base || !secret) return;
  try {
    await fetch(`${base}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-porter-push-secret": secret },
      body: JSON.stringify({ seller_id: sellerId, title, body }),
    });
  } catch (e) {
    console.error("[razorpay-webhook] push", e);
  }
}

async function markOrderPaidFromLink(supabase: ReturnType<typeof createSupabaseServiceRoleClient>, linkId: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, sellers(*)")
    .eq("razorpay_payment_link_id", linkId)
    .maybeSingle();

  if (error || !order) {
    console.error("[razorpay-webhook] order lookup", error);
    return;
  }

  const seller = order.sellers as import("@/types").Seller;
  const now = new Date().toISOString();

  await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: now,
      status: "preparing",
    })
    .eq("id", order.id);

  await insertOrderEvent(supabase, {
    orderId: order.id as string,
    sellerId: order.seller_id as string,
    eventType: "payment_received_webhook",
    status: "preparing",
    paymentStatus: "paid",
    note: "payment_link.paid",
    source: "webhook",
  });

  await supabase
    .from("conversations")
    .update({ state: "complete", last_message_at: now })
    .eq("seller_id", order.seller_id)
    .eq("customer_phone", normalizePhone(order.customer_phone as string));

  const phone = normalizePhone(order.customer_phone as string);
  await sendMessage(phone, "✅ Payment received! Your order is being packed. ~30 mins. 🛵", seller);
  void notifyOrderPush(order.seller_id as string, "Payment received", `₹${order.total_amount} — order ${String(order.id).slice(0, 8)}`);
}

async function findOrderForPayment(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  payment: { id?: string; order_id?: string; notes?: Record<string, string> }
) {
  const porterId = payment.notes?.porter_order_id;
  if (porterId) {
    const { data } = await supabase.from("orders").select("*, sellers(*)").eq("id", porterId).maybeSingle();
    if (data) return data;
  }
  if (payment.order_id) {
    const { data } = await supabase.from("orders").select("*, sellers(*)").eq("razorpay_order_id", payment.order_id).maybeSingle();
    if (data) return data;
  }
  return null;
}

async function handlePaymentCaptured(payload: { payment?: { entity?: Record<string, unknown> } }) {
  const ent = payload.payment?.entity as
    | { id?: string; order_id?: string; notes?: Record<string, string>; amount?: number }
    | undefined;
  if (!ent?.id) return;
  const supabase = createSupabaseServiceRoleClient();
  const order = await findOrderForPayment(supabase, ent);
  if (!order) {
    console.warn("[razorpay-webhook] payment.captured no matching order", ent.order_id);
    return;
  }
  const now = new Date().toISOString();
  await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: now,
      status: "preparing",
      razorpay_order_id: ent.order_id ?? order.razorpay_order_id,
    })
    .eq("id", order.id);

  await insertOrderEvent(supabase, {
    orderId: order.id as string,
    sellerId: order.seller_id as string,
    eventType: "payment_received_webhook",
    status: "preparing",
    paymentStatus: "paid",
    note: `payment.captured razorpay_payment=${ent.id ?? ""}`,
    source: "webhook",
  });

  const seller = order.sellers as import("@/types").Seller;
  await supabase
    .from("conversations")
    .update({ state: "complete", last_message_at: now })
    .eq("seller_id", order.seller_id)
    .eq("customer_phone", normalizePhone(order.customer_phone as string));

  await sendMessage(
    normalizePhone(order.customer_phone as string),
    "✅ Payment received! Your order is being packed. ~30 mins. 🛵",
    seller
  );
  void notifyOrderPush(order.seller_id as string, "Payment received", `₹${order.total_amount}`);
}

async function handlePaymentFailed(payload: { payment?: { entity?: Record<string, unknown> } }) {
  const ent = payload.payment?.entity as { order_id?: string; notes?: Record<string, string> } | undefined;
  if (!ent) return;
  const supabase = createSupabaseServiceRoleClient();
  const order = await findOrderForPayment(supabase, ent as { order_id?: string; notes?: Record<string, string> });
  if (!order) return;
  const seller = order.sellers as import("@/types").Seller;
  const phone = normalizePhone(order.customer_phone as string);
  await sendMessage(phone, "Payment nathi thayu. Ferthi payment link par try karo.", seller);
  await insertOrderEvent(supabase, {
    orderId: order.id as string,
    sellerId: order.seller_id as string,
    eventType: "payment_failed_webhook",
    status: order.status as string,
    paymentStatus: order.payment_status as string,
    note: "payment.failed",
    source: "webhook",
  });
  await supabase
    .from("conversations")
    .update({ state: "awaiting_payment", last_message_at: new Date().toISOString() })
    .eq("seller_id", order.seller_id)
    .eq("customer_phone", phone);
}

/** Razorpay webhook: signature verify + payment events. */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET missing");
    return new Response("Server misconfigured", { status: 500 });
  }

  const rawBody = await req.text();
  const sig = req.headers.get("x-razorpay-signature");
  if (!verifySignature(rawBody, sig, secret)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { event?: string; payload?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const ev = event.event;
  const payload = event.payload ?? {};
  console.log(JSON.stringify({ scope: "razorpay-webhook", event: ev ?? null }));

  if (ev === "payment_link.paid") {
    const pl = (event as { payment_link?: { entity?: { id?: string } } }).payment_link;
    const linkId =
      (payload as { payment_link?: { entity?: { id?: string } } }).payment_link?.entity?.id ??
      pl?.entity?.id ??
      (payload as { entity?: { id?: string } }).entity?.id;
    if (linkId) waitUntil(markOrderPaidFromLink(createSupabaseServiceRoleClient(), linkId));
  } else if (ev === "payment.captured" || ev === "order.paid") {
    waitUntil(handlePaymentCaptured(payload as { payment?: { entity?: Record<string, unknown> } }));
  } else if (ev === "payment.failed") {
    waitUntil(handlePaymentFailed(payload as { payment?: { entity?: Record<string, unknown> } }));
  }

  return new Response("OK", { status: 200 });
}
