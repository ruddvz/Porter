import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { classifyIntent, parseFullOrder, parseOrderText } from "@/lib/gemini";
import { sendMessage } from "@/lib/meta-whatsapp";
import { createPaymentLink } from "@/lib/razorpay";
import { fuzzyMatchProducts } from "@/lib/fuzzy";
import { isProductListedForBot } from "@/lib/product-catalog";
import { checkGate } from "@/lib/plan-gates";
import { getRazorpayKeysForSeller } from "@/lib/seller-credentials";
import type {
  Conversation,
  ConversationContext,
  FullOrderParse,
  MessageIntent,
  OrderStatus,
  ParsedLineItem,
  PaymentMethod,
  PaymentStatus,
  Product,
  Seller,
} from "@/types";
import Fuse from "fuse.js";

const SAME_ORDER_PHRASES = [
  "same as last time",
  "same order",
  "same",
  "pehla wala",
  "pachhlun",
  "aaglu j",
];

/** Loads seller by Meta phone_number_id (WABA number). */
export async function getSellerByMetaPhoneNumberId(phoneNumberId: string): Promise<Seller | null> {
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

export type IncomingMessageOptions = {
  isFirstMessage?: boolean;
};

/** Main entry: loads conversation, runs state machine, persists updates and sends WhatsApp replies. */
export async function handleIncomingCustomerMessage(
  seller: Seller,
  customerPhone: string,
  text: string,
  options?: IncomingMessageOptions
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

  await supabase
    .from("conversations")
    .update({ nudge_count: 0, last_nudge_at: null })
    .eq("id", conversation.id);

  const welcomeAlreadySent =
    conversation.state === "collecting_items" &&
    (await sendFirstContactWelcomeIfNeeded(
      supabase,
      seller,
      phone,
      conversation,
      now,
      options?.isFirstMessage === true
    ));

  const ctx: ConversationContext = (conversation.context as ConversationContext) ?? {};

  switch (conversation.state) {
    case "collecting_items":
      await runCollectingItems(supabase, seller, conversation, phone, text, now, welcomeAlreadySent);
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

function formatWorkingHoursHint(h: Seller["working_hours"]): string {
  if (!h || typeof h !== "object") return "";
  const parts: string[] = [];
  for (const d of ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const) {
    const x = h[d];
    if (x?.open && x?.close) parts.push(`${d}: ${x.open}–${x.close}`);
  }
  if (!parts.length) return "";
  return `\n\nHours:\n${parts.join("\n")}`;
}

/** First-contact welcome: custom `bot_intro_message` or default copy. Returns true if a message was sent. */
async function sendFirstContactWelcomeIfNeeded(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  phone: string,
  conversation: Conversation,
  now: string,
  isFirstMessage: boolean
): Promise<boolean> {
  if (!isFirstMessage) return false;
  const custom = seller.plan === "growth" ? seller.bot_intro_message?.trim() : "";
  const zones = (seller.delivery_zones ?? []).filter(Boolean).join(" · ");
  const defaultWelcome = `Kem cho! 👋 Welcome to ${seller.store_name} on Porter.

I'm your order assistant. Here's how to order:

📝 Just type your list:
'5kg bataka, 2 litre tael, amul butter'

I understand Gujarati, Hindi and English!

Delivery areas: ${zones || "—"}
Payment: Online (UPI/Card) or Cash on Delivery

Send your list whenever you're ready 🛒${formatWorkingHoursHint(seller.working_hours ?? null)}`;

  const msg = custom && custom.length > 0 ? custom : defaultWelcome;
  await sendMessage(phone, msg, seller);
  await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
  return true;
}

function normalizeWaPhone(from: string): string {
  const digits = from.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (from.startsWith("+")) return `+${digits}`;
  return `+${digits}`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function matchSameOrderShortcut(text: string): boolean {
  const t = text.trim().toLowerCase();
  return SAME_ORDER_PHRASES.some((p) => t.includes(p));
}

async function runCollectingItems(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  welcomeAlreadySent: boolean
) {
  const { data: products } = await supabase.from("products").select("*").eq("seller_id", seller.id);

  const list = ((products ?? []) as Product[]).filter(isProductListedForBot);
  const zones = seller.delivery_zones ?? [];

  if (matchSameOrderShortcut(text)) {
    const handled = await handleSameAsLastTime(supabase, seller, conversation, phone, now);
    if (handled) return;
  }

  let fullParse: FullOrderParse | null = null;
  if (text.trim().length >= 8) {
    fullParse = await parseFullOrder(text, list, zones);
  }

  if (fullParse && (fullParse.confidence === "full" || fullParse.confidence === "partial")) {
    const matched = matchFullOrderItemsToCatalog(fullParse, list);
    if (matched.length === 0) {
      await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent);
      return;
    }
    const total = round2(matched.reduce((s, i) => s + i.total_price, 0));

    if (fullParse.confidence === "full") {
      const areaRaw = fullParse.area?.trim() ?? "";
      const addressRaw = fullParse.address?.trim() ?? "";
      const zoneMatch = zones.length ? matchZone(areaRaw, zones) : areaRaw || null;
      if (!zoneMatch || !addressRaw) {
        await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent);
        return;
      }
      const paymentMethod: PaymentMethod | null =
        fullParse.paymentMethod === "cod" ? "cod" : fullParse.paymentMethod === "razorpay" ? "razorpay" : null;
      if (!paymentMethod) {
        await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent);
        return;
      }
      if (paymentMethod === "cod" && !seller.cod_enabled) {
        await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent);
        return;
      }
      await finalizeOrderFromContext(supabase, seller, conversation, phone, now, {
        items: matched,
        order_total: total,
        payment_method: paymentMethod,
        area: zoneMatch,
        address: addressRaw,
        notes: "fast_path: true",
      });
      return;
    }

    // partial: items + area + address, payment missing
    const areaRaw = fullParse.area?.trim() ?? "";
    const addressRaw = fullParse.address?.trim() ?? "";
    const zoneMatch = zones.length ? matchZone(areaRaw, zones) : areaRaw || null;
    if (!zoneMatch || !addressRaw) {
      await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent);
      return;
    }
    const lines = matched.map((i) => `• ${i.product_name} — ${i.quantity} ${i.unit} × ₹${i.unit_price} = ₹${i.total_price}`);
    await supabase
      .from("conversations")
      .update({
        state: "collecting_payment_method",
        context: {
          items: matched,
          order_total: total,
          area: zoneMatch,
          address: addressRaw,
        },
        last_message_at: now,
      })
      .eq("id", conversation.id);
    const msg = `Got it!\n${lines.join("\n")}\n💰 Total: ₹${total}\n📍 ${zoneMatch} — ${addressRaw}\n\nHow to pay?\n1️⃣ Online (UPI/Card)\n2️⃣ Cash on Delivery`;
    await sendMessage(phone, msg, seller);
    return;
  }

  // items_only or null → fall through to classification + normal parse
  await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent);
}

async function continueNormalParse(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  list: Product[],
  welcomeAlreadySent: boolean
) {
  if (text.trim().length < 60) {
    const intent = await classifyIntent(text);
    if (intent !== "order") {
      await handleShortIntent(supabase, seller, conversation, phone, text, now, intent, welcomeAlreadySent);
      return;
    }
  }

  const parsed = await parseOrderText(text, list);
  if (parsed.length === 0) {
    await sendMessage(phone, "Samajyu nathi — ferthi tamari list moklo (Gujarati / Hindi / English).", seller);
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return;
  }

  for (const it of parsed) {
    if (!it.product_id) continue;
    const { data: prow } = await supabase.from("products").select("stock_quantity, in_stock, name").eq("id", it.product_id).maybeSingle();
    if (!prow) continue;
    const sq =
      typeof (prow as { stock_quantity?: number }).stock_quantity === "number"
        ? (prow as { stock_quantity: number }).stock_quantity
        : (prow as { in_stock: boolean }).in_stock
          ? 1
          : 0;
    if (it.quantity > sq) {
      const oos = seller.bot_out_of_stock_message?.trim() || "Sorry, that item is out of stock right now.";
      await sendMessage(phone, `${oos}\n${(prow as { name: string }).name}: requested ${it.quantity}, available ${sq}.`, seller);
      await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
      return;
    }
  }
  const total = round2(parsed.reduce((s, i) => s + i.total_price, 0));
  const lines = parsed.map(
    (i) => `• ${i.product_name} — ${i.quantity} ${i.unit} × ₹${i.unit_price} = ₹${i.total_price}`
  );

  if (!seller.cod_enabled) {
    const zones = seller.delivery_zones ?? [];
    const zoneHint = zones.length > 0 ? `\n\nDelivery areas: ${zones.join(", ")}` : "";
    await supabase
      .from("conversations")
      .update({
        state: "collecting_area",
        context: { items: parsed, order_total: total, payment_method: "razorpay" as PaymentMethod },
        last_message_at: now,
      })
      .eq("id", conversation.id);
    const msg = `Got it! Here's your order:\n${lines.join("\n")}\n💰 Total: ₹${total}\n\nOnline payment only on this store.${zoneHint}\n\nTamaro area moklo.`;
    await sendMessage(phone, msg, seller);
    return;
  }

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

async function handleShortIntent(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  intent: MessageIntent,
  welcomeAlreadySent: boolean
) {
  if (intent === "greeting") {
    if (welcomeAlreadySent) {
      await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
      return;
    }
    const { count } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", seller.id)
      .eq("customer_phone", phone);
    const prev = (count ?? 0) > 0;
    if (!prev) {
      await sendMessage(
        phone,
        `Kem cho! 👋 Welcome to ${seller.store_name} on Porter.

I'm your order assistant. Here's how to order:

📝 Just type your list:
'5kg bataka, 2 litre tael, amul butter'

I understand Gujarati, Hindi and English!

Delivery areas: ${(seller.delivery_zones ?? []).filter(Boolean).join(" · ") || "—"}
Payment: Online (UPI/Card) or Cash on Delivery

Send your list whenever you're ready 🛒`,
        seller
      );
    } else {
      await sendMessage(phone, "Welcome back! 👋 Send me your list anytime — I'm ready. 🛒", seller);
    }
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return;
  }

  if (intent === "question") {
    const phoneLine = seller.whatsapp_number
      ? `\nOr call the shop directly: ${seller.whatsapp_number}`
      : "";
    await sendMessage(
      phone,
      `Hi! For pricing and availability, just send me the item name and I'll check.${phoneLine}\nTo place an order, just send your list! 🛒`,
      seller
    );
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return;
  }

  if (intent === "other") {
    await sendMessage(
      phone,
      `Hi! I'm the order bot for ${seller.store_name}. 🤖
Send me your grocery list to place an order.
Example: '5kg aloo, amul butter, 2L tael'`,
      seller
    );
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return;
  }
}

function matchFullOrderItemsToCatalog(full: FullOrderParse, products: Product[]): ParsedLineItem[] {
  const out: ParsedLineItem[] = [];
  for (const it of full.items) {
    const line = `${it.quantity} ${it.unit} ${it.name}`.trim();
    const fuzzy = fuzzyMatchProducts(line, products);
    if (!fuzzy) continue;
    const p = fuzzy.product;
    const qty = Number(it.quantity) > 0 ? Number(it.quantity) : 1;
    const unit = it.unit?.trim() || p.unit;
    const unitPrice = Number(p.price);
    out.push({
      product_id: p.id,
      product_name: p.name,
      quantity: qty,
      unit,
      unit_price: unitPrice,
      total_price: round2(qty * unitPrice),
    });
  }
  return out;
}

/** Same-as-last-time shortcut. Returns true if handled. */
async function handleSameAsLastTime(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  now: string
): Promise<boolean> {
  const { data: lastOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("seller_id", seller.id)
    .eq("customer_phone", phone)
    .eq("status", "delivered")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastOrder?.id) {
    await sendMessage(phone, "I don't have a previous order for you. Send me your list!", seller);
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return true;
  }

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", lastOrder.id);
  const parsed: ParsedLineItem[] = (items ?? []).map((i) => ({
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: Number(i.quantity),
    unit: i.unit,
    unit_price: Number(i.unit_price),
    total_price: Number(i.total_price),
  }));

  const { data: cust } = await supabase
    .from("customers")
    .select("default_area, default_address")
    .eq("seller_id", seller.id)
    .eq("phone_number", phone)
    .maybeSingle();

  const area = cust?.default_area as string | null | undefined;
  const address = cust?.default_address as string | null | undefined;
  const zones = seller.delivery_zones ?? [];
  const zoneMatch = area ? (zones.length ? matchZone(area, zones) : area) : null;

  const total = round2(parsed.reduce((s, i) => s + i.total_price, 0));
  const lines = parsed.map((i) => `• ${i.product_name} — ${i.quantity} ${i.unit} × ₹${i.unit_price} = ₹${i.total_price}`);

  if (zoneMatch && address) {
    await supabase
      .from("conversations")
      .update({
        state: "collecting_payment_method",
        context: {
          items: parsed,
          order_total: total,
          area: zoneMatch,
          address: address.trim(),
        },
        last_message_at: now,
      })
      .eq("id", conversation.id);
    await sendMessage(
      phone,
      `Same order loaded!\n${lines.join("\n")}\n💰 Total: ₹${total}\n📍 ${zoneMatch} — ${address}\n\nHow to pay?\n1️⃣ Online (UPI/Card)\n2️⃣ Cash on Delivery`,
      seller
    );
    return true;
  }

  await supabase
    .from("conversations")
    .update({
      state: "collecting_area",
      context: { items: parsed, order_total: total },
      last_message_at: now,
    })
    .eq("id", conversation.id);
  const zoneHint = zones.length ? `\n\nDelivery areas: ${zones.join(", ")}` : "";
  await sendMessage(phone, `Here's your last order:\n${lines.join("\n")}\n💰 Total: ₹${total}${zoneHint}\n\nTamaro area moklo.`, seller);
  return true;
}

async function adjustProductStockAfterOrder(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  items: ParsedLineItem[]
) {
  for (const it of items) {
    if (!it.product_id) continue;
    const { data: row } = await supabase.from("products").select("stock_quantity, in_stock").eq("id", it.product_id).maybeSingle();
    if (!row) continue;
    const prev = (row as { stock_quantity?: number; in_stock: boolean }).stock_quantity;
    const sq = typeof prev === "number" ? prev : row.in_stock ? 1 : 0;
    const next = Math.max(0, sq - it.quantity);
    await supabase
      .from("products")
      .update({
        stock_quantity: next,
        in_stock: next > 0,
        is_active: next > 0,
      })
      .eq("id", it.product_id);
  }
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
    console.error("[conversation] push notify", e);
  }
}

async function finalizeOrderFromContext(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  now: string,
  ctx: ConversationContext & { notes?: string }
) {
  const items = ctx.items ?? [];
  const paymentMethod = ctx.payment_method ?? "razorpay";
  const area = ctx.area ?? "";
  const address = (ctx.address ?? "").trim();
  const total = ctx.order_total ?? round2(items.reduce((s, i) => s + i.total_price, 0));

  const rzp = getRazorpayKeysForSeller(seller);
  if (paymentMethod === "razorpay" && !rzp) {
    await sendMessage(phone, "Online payment setup pending on store side. Store ne call karo.", seller);
    return;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count: monthOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id)
    .gte("created_at", startOfMonth.toISOString());
  const gate = checkGate(seller, "orders_monthly", { ordersThisMonth: (monthOrders ?? 0) + 1 });
  if (!gate.ok) {
    await sendMessage(phone, `Order limit reached for this month. ${gate.reason}`, seller);
    return;
  }

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

  const paymentStatus: PaymentStatus = paymentMethod === "cod" ? "cod_pending" : "unpaid";
  const orderStatus: OrderStatus = paymentMethod === "cod" ? "confirmed" : "pending";

  const insertPayload: Record<string, unknown> = {
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
  };
  if (ctx.notes) insertPayload.notes = ctx.notes;

  const { data: order, error: orderErr } = await supabase.from("orders").insert(insertPayload).select("*").single();

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
  await adjustProductStockAfterOrder(supabase, items);

  if (customerId) {
    const { data: c } = await supabase.from("customers").select("order_count").eq("id", customerId).single();
    const oc = (c?.order_count as number) ?? 0;
    await supabase.from("customers").update({ order_count: oc + 1 }).eq("id", customerId);
  }

  const summaryLines = items.map((i) => `• ${i.product_name} — ${i.quantity} ${i.unit} — ₹${i.total_price}`);
  const summary = summaryLines.join("\n");

  const tpl = seller.bot_order_confirmation_template?.trim();
  function formatConfirm(extra: string) {
    if (!tpl) return extra;
    return tpl
      .replace(/\{\{summary\}\}/g, summary)
      .replace(/\{\{total\}\}/g, String(total))
      .replace(/\{\{store\}\}/g, seller.store_name)
      .replace(/\{\{id\}\}/g, order.id.slice(0, 8));
  }

  if (paymentMethod === "razorpay" && rzp) {
    const link = await createPaymentLink({
      amountPaise: Math.round(total * 100),
      order: order,
      keyId: rzp.keyId,
      keySecret: rzp.keySecret,
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        : undefined,
    });
    if (!link) {
      await supabase.from("order_items").delete().eq("order_id", order.id);
      await supabase.from("orders").delete().eq("id", order.id);
      if (customerId) {
        const { data: c } = await supabase.from("customers").select("order_count").eq("id", customerId).single();
        const oc = Math.max(0, ((c?.order_count as number) ?? 1) - 1);
        await supabase.from("customers").update({ order_count: oc }).eq("id", customerId);
      }
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

    const msg = formatConfirm(
      `✅ Order confirmed!\n${summary}\n📍 ${area} — ${address}\n💰 Total: ₹${total}\n${link.short_url}\n\n*Porter — ${seller.store_name}*`
    );
    await sendMessage(phone, msg, seller);
    return;
  }

  await supabase
    .from("conversations")
    .update({
      state: "complete",
      context: { ...ctx, address, order_id: order.id },
      last_message_at: now,
    })
    .eq("id", conversation.id);

  const codMsg = formatConfirm(
    `✅ Order confirmed!\n${summary}\n📍 ${area} — ${address}\n💰 Total: ₹${total}\nCash on delivery — pay rider ₹${total}\n\n*Porter — ${seller.store_name}*`
  );
  await sendMessage(phone, codMsg, seller);
  void notifyOrderPush(seller.id, "New order", `₹${total} — ${order.id.slice(0, 8)}`);
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
    await sendMessage(phone, "COD aa store par available nathi. Reply 1 for online payment.", seller);
    return;
  }

  if (!method) {
    await sendMessage(phone, "Reply 1 for online payment, 2 for Cash on Delivery.", seller);
    return;
  }

  const zones = seller.delivery_zones ?? [];
  const zoneHint = zones.length > 0 ? `\n\nDelivery areas: ${zones.join(", ")}` : "";

  const area = ctx.area?.trim();
  const address = ctx.address?.trim();
  const items = ctx.items ?? [];

  if (area && address && items.length > 0) {
    await finalizeOrderFromContext(supabase, seller, conversation, phone, now, {
      ...ctx,
      payment_method: method,
    });
    return;
  }

  await supabase
    .from("conversations")
    .update({
      state: "collecting_area",
      context: { ...ctx, payment_method: method },
      last_message_at: now,
    })
    .eq("id", conversation.id);

  await sendMessage(phone, `Tamaro area moklo (building / society naam optional).${zoneHint}`, seller);
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
      zones.length > 0 ? `Area match nathi thayu. Valid zones: ${zones.join(", ")}` : "Area samajyu nathi — ferthi moklo.",
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

  await sendMessage(phone, `Got it — ${match}. Please send your full address (building + flat number).`, seller);
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
  const address = text.trim();
  await finalizeOrderFromContext(supabase, seller, conversation, phone, now, {
    ...ctx,
    address,
  });
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
  void conversation;
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
  await sendMessage(phone, `Pay ₹${order.total_amount} here 👇\n${order.razorpay_payment_link_url}`, seller);
}

/** Fuzzy-picks a delivery zone from the seller's zone list. */
function matchZone(input: string, zones: string[]): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (zones.length === 0) return trimmed;
  const fuse = new Fuse(zones, { includeScore: true, threshold: 0.5 });
  const r = fuse.search(trimmed);
  if (!r[0] || r[0].score == null) return null;
  const conf = 1 - r[0].score;
  return conf >= 0.45 ? r[0].item : null;
}
