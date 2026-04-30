import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { parseOrderText } from "@/lib/gemini";
import { sendMessage } from "@/lib/meta-whatsapp";
import { createPaymentLink } from "@/lib/razorpay";
import type {
  Conversation,
  ConversationContext,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Seller,
} from "@/types";
import Fuse from "fuse.js";

/** Loads seller by Meta phone_number_id (WABA number). */
export async function getSellerByMetaPhoneNumberId(
  phoneNumberId: string
): Promise<Seller | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("sellers")
    .select("*")
    .eq("meta_phone_number_id", phoneNumberId)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    console.error("[conversation] seller lookup", error);
    return null;
  }
  return data as Seller | null;
}

/** Main entry: loads conversation, runs state machine, persists updates and sends WhatsApp replies. */
export async function handleIncomingCustomerMessage(
  seller: Seller,
  customerPhone: string,
  text: string
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const now = new Date().toISOString();
  const phone = normalizeWaPhone(customerPhone);

  const { data: convRow, error: convErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("seller_id", seller.id)
    .eq("customer_phone", phone)
    .maybeSingle();

  if (convErr) {
    console.error("[conversation] load", convErr);
    return;
  }

  let conversation = convRow as Conversation | null;
  if (!conversation) {
    const { data: inserted, error: insErr } = await supabase
      .from("conversations")
      .insert({
        seller_id: seller.id,
        customer_phone: phone,
        state: "collecting_items",
        context: {},
        last_message_at: now,
      })
      .select("*")
      .single();
    if (insErr) {
      console.error("[conversation] insert", insErr);
      return;
    }
    conversation = inserted as Conversation;
  }

  if (conversation.state === "complete" || conversation.state === "failed") {
    await supabase
      .from("conversations")
      .update({
        state: "collecting_items",
        context: {},
        last_message_at: now,
      })
      .eq("id", conversation.id);
    conversation = {
      ...conversation,
      state: "collecting_items",
      context: {},
    };
  }

  const ctx: ConversationContext = (conversation.context as ConversationContext) ?? {};

  switch (conversation.state) {
    case "collecting_items":
      await runCollectingItems(supabase, seller, conversation, phone, text, now);
      break;
    case "collecting_payment_method":
      await runCollectingPaymentMethod(supabase, seller, conversation, phone, text, now, ctx);
      break;
    case "collecting_area":
      await runCollectingArea(supabase, seller, conversation, phone, text, now, ctx);
      break;
    case "collecting_address":
      await runCollectingAddress(supabase, seller, conversation, phone, text, now, ctx);
      break;
    case "awaiting_payment":
      await runAwaitingPayment(supabase, seller, conversation, phone, text, ctx);
      break;
    default:
      break;
  }
}

function normalizeWaPhone(from: string): string {
  const digits = from.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (from.startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

/** Parses grocery lines and moves customer to payment method selection with order summary. */
async function runCollectingItems(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string
) {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", seller.id)
    .eq("in_stock", true);

  const list = (products ?? []) as import("@/types").Product[];
  const parsed = await parseOrderText(text, list);
  if (parsed.length === 0) {
    await sendMessage(
      phone,
      "Samajyu nathi — ferthi tamari list moklo (Gujarati / Hindi / English).",
      seller
    );
    await supabase
      .from("conversations")
      .update({ last_message_at: now })
      .eq("id", conversation.id);
    return;
  }

  const total = round2(parsed.reduce((s, i) => s + i.total_price, 0));
  const lines = parsed.map((i) => `• ${i.product_name} — ${i.quantity} ${i.unit} × ₹${i.unit_price} = ₹${i.total_price}`);
  const msg = `Got it! Here's your order:\n${lines.join("\n")}\n💰 Total: ₹${total}\n\nHow do you want to pay?\n1️⃣ Online (UPI/Card) — pay now\n2️⃣ Cash on Delivery — pay when it arrives\n\nReply 1 or 2`;

  await supabase
    .from("conversations")
    .update({
      state: "collecting_payment_method",
      context: { items: parsed, order_total: total },
      last_message_at: now,
    })
    .eq("id", conversation.id);

  await sendMessage(phone, msg, seller);
}

/** Records prepaid vs COD and asks for delivery area. */
async function runCollectingPaymentMethod(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  ctx: ConversationContext
) {
  const t = text.trim().toLowerCase();
  let method: PaymentMethod | null = null;
  if (t === "1" || t.includes("online") || t.includes("upi") || t.includes("card") || t.includes("prepaid")) {
    method = "razorpay";
  } else if (t === "2" || t.includes("cod") || t.includes("cash")) {
    method = "cod";
  }

  if (method === "cod" && !seller.cod_enabled) {
    await sendMessage(
      phone,
      "COD aa store par available nathi. Reply 1 for online payment.",
      seller
    );
    return;
  }

  if (!method) {
    await sendMessage(
      phone,
      "Reply 1 for online payment, 2 for Cash on Delivery.",
      seller
    );
    return;
  }

  const zones = seller.delivery_zones ?? [];
  const zoneHint =
    zones.length > 0 ? `\n\nDelivery areas: ${zones.join(", ")}` : "";

  await supabase
    .from("conversations")
    .update({
      state: "collecting_area",
      context: { ...ctx, payment_method: method },
      last_message_at: now,
    })
    .eq("id", conversation.id);

  await sendMessage(
    phone,
    `Tamaro area moklo (building / society naam optional).${zoneHint}`,
    seller
  );
}

/** Matches customer area to configured delivery zones or asks again. */
async function runCollectingArea(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  ctx: ConversationContext
) {
  const zones = seller.delivery_zones ?? [];
  const match = matchZone(text, zones);
  if (!match) {
    await sendMessage(
      phone,
      `Area match nathi thayu. Valid zones: ${zones.join(", ") || "store ne contact karo"}`,
      seller
    );
    return;
  }

  await supabase
    .from("conversations")
    .update({
      state: "collecting_address",
      context: { ...ctx, area: match },
      last_message_at: now,
    })
    .eq("id", conversation.id);

  await sendMessage(
    phone,
    `Got it — ${match}. Please send your full address (building + flat number).`,
    seller
  );
}

/** Persists order (+ payment link for prepaid), then completes or awaits payment. */
async function runCollectingAddress(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  ctx: ConversationContext
) {
  const items = ctx.items ?? [];
  const paymentMethod = ctx.payment_method ?? "razorpay";
  const area = ctx.area ?? "";
  const address = text.trim();
  const total = ctx.order_total ?? round2(items.reduce((s, i) => s + i.total_price, 0));

  const { data: cust } = await supabase
    .from("customers")
    .upsert(
      {
        seller_id: seller.id,
        phone_number: phone,
        default_area: area,
        default_address: address,
      },
      { onConflict: "seller_id,phone_number" }
    )
    .select("id")
    .single();

  const customerId = cust?.id as string | undefined;

  const paymentStatus: PaymentStatus =
    paymentMethod === "cod" ? "cod_pending" : "unpaid";
  const orderStatus: OrderStatus =
    paymentMethod === "cod" ? "confirmed" : "confirmed";

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      seller_id: seller.id,
      customer_id: customerId ?? null,
      customer_phone: phone,
      customer_name: null,
      delivery_area: area,
      delivery_address: address,
      total_amount: total,
      status: orderStatus,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
    })
    .select("*")
    .single();

  if (orderErr || !order) {
    console.error("[conversation] order insert", orderErr);
    await sendMessage(phone, "Order save ma problem aavi. Ferthi try karo.", seller);
    return;
  }

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit: i.unit,
    unit_price: i.unit_price,
    total_price: i.total_price,
  }));
  await supabase.from("order_items").insert(orderItems);

  if (customerId) {
    const { data: c } = await supabase.from("customers").select("order_count").eq("id", customerId).single();
    const oc = (c?.order_count as number) ?? 0;
    await supabase.from("customers").update({ order_count: oc + 1 }).eq("id", customerId);
  }

  const summaryLines = items.map(
    (i) => `• ${i.product_name} — ${i.quantity} ${i.unit} — ₹${i.total_price}`
  );
  const summary = summaryLines.join("\n");

  if (paymentMethod === "razorpay") {
    if (!seller.razorpay_key_id || !seller.razorpay_key_secret) {
      await sendMessage(
        phone,
        "Online payment setup pending on store side. Store ne call karo.",
        seller
      );
      return;
    }
    const link = await createPaymentLink({
      amountPaise: Math.round(total * 100),
      order: order,
      keyId: seller.razorpay_key_id,
      keySecret: seller.razorpay_key_secret,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        : undefined,
    });
    if (!link) {
      await sendMessage(phone, "Payment link banavi shakyu nathi. Ferthi try karo.", seller);
      return;
    }
    await supabase
      .from("orders")
      .update({
        razorpay_payment_link_id: link.id,
        razorpay_payment_link_url: link.short_url,
      })
      .eq("id", order.id);

    await supabase
      .from("conversations")
      .update({
        state: "awaiting_payment",
        context: { ...ctx, address, order_id: order.id },
        last_message_at: now,
      })
      .eq("id", conversation.id);

    const msg = `✅ Order confirmed!\n${summary}\n📍 ${area} — ${address}\n\nPay ₹${total} here 👇\n${link.short_url}\n\nOrder dispatches after payment. 🛵`;
    await sendMessage(phone, msg, seller);
    return;
  }

  // COD
  await supabase
    .from("conversations")
    .update({
      state: "complete",
      context: { ...ctx, address, order_id: order.id },
      last_message_at: now,
    })
    .eq("id", conversation.id);

  const codMsg = `✅ Order confirmed! (Cash on Delivery)\n${summary}\n📍 ${area} — ${address}\n💰 Pay ₹${total} cash to the delivery rider.\n\nWe'll deliver in ~30-45 mins. 🛵\n\n*Porter by ${seller.store_name}*`;
  await sendMessage(phone, codMsg, seller);
}

/** Resends Razorpay link when customer messages again before paying. */
async function runAwaitingPayment(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  _text: string,
  ctx: ConversationContext
) {
  const orderId = ctx.order_id;
  if (!orderId) {
    await sendMessage(phone, "Order details nathi malya. Ferthi list moklo.", seller);
    return;
  }
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order?.razorpay_payment_link_url) {
    await sendMessage(phone, "Payment link nathi. Store ne contact karo.", seller);
    return;
  }
  await sendMessage(
    phone,
    `Pay ₹${order.total_amount} here 👇\n${order.razorpay_payment_link_url}`,
    seller
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Fuzzy-picks a delivery zone from the seller's zone list. */
function matchZone(input: string, zones: string[]): string | null {
  if (zones.length === 0) return input.trim();
  const fuse = new Fuse(zones, { includeScore: true, threshold: 0.5 });
  const r = fuse.search(input.trim());
  if (!r[0] || r[0].score == null) return null;
  const conf = 1 - r[0].score;
  return conf >= 0.45 ? r[0].item : null;
}
