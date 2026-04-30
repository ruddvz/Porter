import { createHmac, timingSafeEqual } from "crypto";
import { waitUntil } from "@vercel/functions";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { sendMessage } from "@/lib/meta-whatsapp";

export const runtime = "nodejs";

/** Verifies Razorpay webhook signature (raw body + webhook secret). */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/** Razorpay webhook: marks order paid and notifies customer on WhatsApp. */
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

  let event: {
    event?: string;
    payload?: {
      payment_link?: { entity?: { id?: string } };
    };
    payment_link?: { entity?: { id?: string } };
    entity?: { id?: string };
  };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  if (event.event === "payment_link.paid") {
    const pl = (event as { payment_link?: { entity?: { id?: string } } }).payment_link;
    const linkId =
      event.payload?.payment_link?.entity?.id ??
      pl?.entity?.id ??
      (event as { entity?: { id?: string } }).entity?.id;
    if (linkId) {
      waitUntil(handlePaymentLinkPaid(linkId));
    }
  }

  return new Response("OK", { status: 200 });
}

/** Updates order and conversation after prepaid payment, sends confirmation on WhatsApp. */
async function handlePaymentLinkPaid(linkId: string) {
  const supabase = createSupabaseServiceRoleClient();
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
      status: "confirmed",
    })
    .eq("id", order.id);

  await supabase
    .from("conversations")
    .update({ state: "complete", last_message_at: now })
    .eq("seller_id", order.seller_id)
    .eq("customer_phone", normalizePhone(order.customer_phone as string));

  const phone = normalizePhone(order.customer_phone as string);
  await sendMessage(
    phone,
    "✅ Payment received! Your order is being packed. ~30 mins. 🛵",
    seller
  );
}

function normalizePhone(p: string): string {
  const digits = p.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (p.startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}
