import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { classifyIntent, parseFullOrder, parseOrderText } from "@/lib/gemini";
import { sendMessage } from "@/lib/meta-whatsapp";
import { createPaymentLink } from "@/lib/razorpay";
import { fuzzyMatchProducts } from "@/lib/fuzzy";
import { isProductListedForBot } from "@/lib/product-catalog";
import { checkGate } from "@/lib/plan-gates";
import { getRazorpayKeysForSeller, getUpiForSeller } from "@/lib/seller-credentials";
import { insertOrderEvent } from "@/lib/order-events";
import type {
  BotLanguagePreference,
  Conversation,
  ConversationContext,
  FullOrderParse,
  MessageIntent,
  Order,
  OrderStatus,
  ParsedLineItem,
  PaymentMethod,
  PaymentStatus,
  Product,
  Seller,
} from "@/types";
import Fuse from "fuse.js";
import {
  firstWelcomeBody,
  formatOrderConfirmedCod,
  formatOrderConfirmedPrepaid,
  formatOrderConfirmedUpiManual,
  formatOrderSummaryPrompt,
  formatPartialPaymentPrompt,
  formatSameOrderPaymentPrompt,
  normalizeBotLanguagePref,
  replyLangForMessage,
  t,
  type ReplyLang,
} from "@/lib/bot-locale";
import { isSellerWithinWorkingHours } from "@/lib/working-hours";
import { parseReferralHint } from "@/lib/referral";
import { parseScheduledDeliveryHint } from "@/lib/scheduled-delivery";

function geminiLangOpts(seller: Seller) {
  return { botLanguage: normalizeBotLanguagePref(seller.bot_language) as BotLanguagePreference };
}

function effectiveReplyLang(seller: Seller, customerText: string, ctx: ConversationContext): ReplyLang {
  const pref = normalizeBotLanguagePref(seller.bot_language);
  if (pref === "gujarati" || pref === "hindi") return pref;
  if (pref === "english") return "english";
  const cached = ctx.detected_reply_lang;
  if (cached === "gujarati" || cached === "hindi" || cached === "english") return cached;
  return replyLangForMessage("auto", customerText);
}

function replyLangFromCtx(seller: Seller, ctx: ConversationContext): ReplyLang {
  const d = ctx.detected_reply_lang;
  if (d === "gujarati" || d === "hindi" || d === "english") return d;
  return normalizeBotLanguagePref(seller.bot_language) === "gujarati"
    ? "gujarati"
    : normalizeBotLanguagePref(seller.bot_language) === "hindi"
      ? "hindi"
      : "english";
}

async function persistAutoDetectedLang(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  conversationId: string,
  seller: Seller,
  customerText: string,
  ctx: ConversationContext
): Promise<ConversationContext> {
  if (normalizeBotLanguagePref(seller.bot_language) !== "auto") return ctx;
  const detected = replyLangForMessage("auto", customerText);
  if (ctx.detected_reply_lang === detected) return ctx;
  const next = { ...ctx, detected_reply_lang: detected };
  await supabase.from("conversations").update({ context: next }).eq("id", conversationId);
  return next;
}

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

  let ctx: ConversationContext = (conversation.context as ConversationContext) ?? {};
  ctx = await persistAutoDetectedLang(supabase, conversation.id, seller, text, ctx);

  if (!isSellerWithinWorkingHours(seller) && conversation.state === "collecting_items") {
    const lang = replyLangFromCtx(seller, ctx);
    const custom = seller.off_hours_message?.trim();
    const msg =
      custom && custom.length > 0
        ? custom
        : t("off_hours_closed", lang, { store: seller.store_name });
    await sendMessage(phone, msg, seller);
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return;
  }

  const welcomeAlreadySent =
    conversation.state === "collecting_items" &&
    (await sendFirstContactWelcomeIfNeeded(
      supabase,
      seller,
      phone,
      conversation,
      now,
      options?.isFirstMessage === true,
      ctx,
      text
    ));

  switch (conversation.state) {
    case "collecting_items":
      await runCollectingItems(supabase, seller, conversation, phone, text, now, welcomeAlreadySent, ctx);
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
    case "awaiting_upi_confirmation":
      await runAwaitingUpiConfirmation(supabase, seller, conversation, phone, text, now, ctx);
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
  isFirstMessage: boolean,
  ctx: ConversationContext,
  customerText: string
): Promise<boolean> {
  if (!isFirstMessage) return false;
  const custom = seller.plan === "growth" ? seller.bot_intro_message?.trim() : "";
  const zones = (seller.delivery_zones ?? []).filter(Boolean).join(" · ");
  const lang = effectiveReplyLang(seller, customerText, ctx);
  const defaultWelcome =
    firstWelcomeBody(seller.store_name, zones || "—", lang) + formatWorkingHoursHint(seller.working_hours ?? null);

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
  welcomeAlreadySent: boolean,
  ctx: ConversationContext
) {
  const { data: products } = await supabase.from("products").select("*").eq("seller_id", seller.id);

  const list = ((products ?? []) as Product[]).filter(isProductListedForBot);
  const zones = seller.delivery_zones ?? [];

  if (matchSameOrderShortcut(text)) {
    const handled = await handleSameAsLastTime(supabase, seller, conversation, phone, now, ctx);
    if (handled) return;
  }

  let fullParse: FullOrderParse | null = null;
  if (text.trim().length >= 8) {
    fullParse = await parseFullOrder(text, list, zones, geminiLangOpts(seller));
  }

  if (fullParse && (fullParse.confidence === "full" || fullParse.confidence === "partial")) {
    const matched = matchFullOrderItemsToCatalog(fullParse, list);
    if (matched.length === 0) {
      await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent, ctx);
      return;
    }
    const total = round2(matched.reduce((s, i) => s + i.total_price, 0));

    if (fullParse.confidence === "full") {
      const areaRaw = fullParse.area?.trim() ?? "";
      const addressRaw = fullParse.address?.trim() ?? "";
      const zoneMatch = zones.length ? matchZone(areaRaw, zones) : areaRaw || null;
      if (!zoneMatch || !addressRaw) {
        await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent, ctx);
        return;
      }
      const pm = fullParse.paymentMethod;
      const paymentMethod: PaymentMethod | null =
        pm === "cod" ? "cod" : pm === "upi_manual" || pm === "razorpay" ? "upi_manual" : null;
      if (!paymentMethod) {
        await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent, ctx);
        return;
      }
      if (paymentMethod === "cod" && !seller.cod_enabled) {
        await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent, ctx);
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
      await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent, ctx);
      return;
    }
    const lines = matched.map((i) => `• ${i.product_name} — ${i.quantity} ${i.unit} × ₹${i.unit_price} = ₹${i.total_price}`);
    await supabase
      .from("conversations")
      .update({
        state: "collecting_payment_method",
        context: {
          ...ctx,
          items: matched,
          order_total: total,
          area: zoneMatch,
          address: addressRaw,
        },
        last_message_at: now,
      })
      .eq("id", conversation.id);
    const msg = formatPartialPaymentPrompt(
      replyLangFromCtx(seller, ctx),
      lines.join("\n"),
      total,
      zoneMatch,
      addressRaw
    );
    await sendMessage(phone, msg, seller);
    return;
  }

  // items_only or null → fall through to classification + normal parse
  await continueNormalParse(supabase, seller, conversation, phone, text, now, list, welcomeAlreadySent, ctx);
}

async function continueNormalParse(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  list: Product[],
  welcomeAlreadySent: boolean,
  ctx: ConversationContext
) {
  const lang = replyLangFromCtx(seller, ctx);
  if (text.trim().length < 60) {
    const intent = await classifyIntent(text, geminiLangOpts(seller));
    if (intent !== "order") {
      await handleShortIntent(supabase, seller, conversation, phone, text, now, intent, welcomeAlreadySent, ctx);
      return;
    }
  }

  const parsed = await parseOrderText(text, list, geminiLangOpts(seller));
  if (parsed.length === 0) {
    await sendMessage(phone, t("parse_failed", lang), seller);
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

  const scheduledIso = parseScheduledDeliveryHint(text);
  const refCode =
    seller.plan === "growth" ? parseReferralHint(text, seller.referral_code ?? undefined) : null;
  const extraCtx = {
    ...(scheduledIso ? { scheduled_for: scheduledIso } : {}),
    ...(refCode ? { referral_code: refCode } : {}),
  } satisfies Partial<ConversationContext>;

  if (!seller.cod_enabled) {
    const zones = seller.delivery_zones ?? [];
    const zoneHint = zones.length > 0 ? `\n\nDelivery areas: ${zones.join(", ")}` : "";
    await supabase
      .from("conversations")
      .update({
        state: "collecting_area",
        context: {
          ...ctx,
          items: parsed,
          order_total: total,
          payment_method: "upi_manual" as PaymentMethod,
          ...extraCtx,
        },
        last_message_at: now,
      })
      .eq("id", conversation.id);
    const msg = formatOrderSummaryPrompt(lang, lines.join("\n"), total, zoneHint, false);
    await sendMessage(phone, msg, seller);
    return;
  }

  const msg = formatOrderSummaryPrompt(lang, lines.join("\n"), total, "", true);

  await supabase
    .from("conversations")
    .update({
      state: "collecting_payment_method",
      context: { ...ctx, items: parsed, order_total: total, ...extraCtx },
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
  welcomeAlreadySent: boolean,
  ctx: ConversationContext
) {
  const lang = replyLangFromCtx(seller, ctx);
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
      const zones = (seller.delivery_zones ?? []).filter(Boolean).join(" · ");
      const body =
        firstWelcomeBody(seller.store_name, zones || "—", lang) + formatWorkingHoursHint(seller.working_hours ?? null);
      await sendMessage(phone, body, seller);
    } else {
      await sendMessage(phone, t("welcome_repeat", lang), seller);
    }
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return;
  }

  if (intent === "question") {
    const phoneLine = seller.whatsapp_number
      ? lang === "gujarati"
        ? `\nઅથવા દુકાન પર કૉલ કરો: ${seller.whatsapp_number}`
        : lang === "hindi"
          ? `\nया दुकान पर कॉल करें: ${seller.whatsapp_number}`
          : `\nOr call the shop directly: ${seller.whatsapp_number}`
      : "";
    await sendMessage(phone, t("question_reply", lang, { phoneLine }), seller);
    await supabase.from("conversations").update({ last_message_at: now }).eq("id", conversation.id);
    return;
  }

  if (intent === "other") {
    await sendMessage(
      phone,
      t("other_reply", lang, { store: seller.store_name }),
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
  now: string,
  ctx: ConversationContext
): Promise<boolean> {
  const lang = replyLangFromCtx(seller, ctx);
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
    await sendMessage(phone, t("same_order_missing", lang), seller);
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
          ...ctx,
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
      formatSameOrderPaymentPrompt(lang, lines.join("\n"), total, zoneMatch, address),
      seller
    );
    return true;
  }

  await supabase
    .from("conversations")
    .update({
      state: "collecting_area",
      context: { ...ctx, items: parsed, order_total: total },
      last_message_at: now,
    })
    .eq("id", conversation.id);
  const zoneHint = zones.length ? `\n\nDelivery areas: ${zones.join(", ")}` : "";
  const zonePrompt =
    lang === "gujarati"
      ? `\n\nતમારો એરિયા મોકલો.${zoneHint}`
      : lang === "hindi"
        ? `\n\nअपना एरिया भेजें.${zoneHint}`
        : `\n\nSend your area.${zoneHint}`;
  await sendMessage(
    phone,
    `${lang === "gujarati" ? "તમારો છેલ્લો ઓર્ડર:" : lang === "hindi" ? "आपका पिछला ऑर्डर:" : "Here's your last order:"}\n${lines.join("\n")}\n💰 Total: ₹${total}${zonePrompt}`,
    seller
  );
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

function trackOrderAppend(order: Order): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const slug = (order as { track_public_slug?: string | null }).track_public_slug;
  if (!base || !slug) return "";
  return `\n\nTrack: ${base}/track/${slug}`;
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
  const lang = replyLangFromCtx(seller, ctx);
  const items = ctx.items ?? [];
  let paymentMethod: PaymentMethod = ctx.payment_method ?? "upi_manual";
  const area = ctx.area ?? "";
  const address = (ctx.address ?? "").trim();
  const total = ctx.order_total ?? round2(items.reduce((s, i) => s + i.total_price, 0));

  const upi = getUpiForSeller(seller);
  const rzp = getRazorpayKeysForSeller(seller);

  if (paymentMethod === "razorpay" && !rzp) {
    paymentMethod = upi ? "upi_manual" : paymentMethod;
  }

  if (paymentMethod === "upi_manual" && !upi) {
    await sendMessage(phone, t("upi_not_configured", lang), seller);
    return;
  }

  if (paymentMethod === "cod" && !seller.cod_enabled) {
    await sendMessage(phone, t("cod_disabled", lang), seller);
    return;
  }

  const minOrder = seller.min_order_amount != null ? Number(seller.min_order_amount) : null;
  if (minOrder != null && Number.isFinite(minOrder) && minOrder > 0 && total < minOrder) {
    await sendMessage(
      phone,
      t("min_order_not_met", lang, { min: String(minOrder), total: String(total) }),
      seller
    );
    return;
  }

  if (paymentMethod === "razorpay" && !rzp) {
    await sendMessage(phone, t("online_pending", lang), seller);
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
    await sendMessage(phone, `${t("monthly_order_cap", lang)} ${gate.reason}`, seller);
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
        ...(ctx.referral_code ? { referred_by_code: ctx.referral_code } : {}),
      },
      { onConflict: "seller_id,phone_number" }
    )
    .select("id")
    .single();

  const customerId = cust?.id as string | undefined;

  if (ctx.referral_code && customerId) {
    await supabase
      .from("customers")
      .update({ referred_by_code: ctx.referral_code })
      .eq("id", customerId)
      .is("referred_by_code", null);
  }

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
  if (ctx.scheduled_for) insertPayload.scheduled_for = ctx.scheduled_for;

  const { data: order, error: orderErr } = await supabase.from("orders").insert(insertPayload).select("*").single();

  if (orderErr || !order) {
    console.error("[conversation] order insert", orderErr);
    await sendMessage(phone, t("order_save_failed", lang), seller);
    return;
  }

  await insertOrderEvent(supabase, {
    orderId: order.id,
    sellerId: seller.id,
    eventType: "order_created",
    status: order.status,
    paymentStatus: order.payment_status ?? undefined,
    source: "bot",
  });

  const orderItems = items.map((i) => ({
    order_id: order.id,
    seller_id: seller.id,
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
      await sendMessage(phone, t("payment_link_failed", lang), seller);
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
      `${formatOrderConfirmedPrepaid(lang, summary, area, address, total, link.short_url, seller.store_name)}${trackOrderAppend(order)}`
    );
    await sendMessage(phone, msg, seller);
    return;
  }

  if (paymentMethod === "upi_manual" && upi) {
    await supabase
      .from("conversations")
      .update({
        state: "awaiting_upi_confirmation",
        context: { ...ctx, address, order_id: order.id },
        last_message_at: now,
      })
      .eq("id", conversation.id);

    const shortId = order.id.slice(0, 8);
    const msg = formatConfirm(
      `${formatOrderConfirmedUpiManual(lang, summary, area, address, total, upi, shortId, seller.store_name)}\n\n${t(
        "awaiting_upi_instructions",
        lang,
        { amount: String(total), upi, shortId }
      )}${trackOrderAppend(order)}`
    );
    await sendMessage(phone, msg, seller);
    void notifyOrderPush(seller.id, "New order — UPI pending", `₹${total} — ${shortId}`);
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

  const codMsg = formatConfirm(`${formatOrderConfirmedCod(lang, summary, area, address, total, seller.store_name)}${trackOrderAppend(order)}`);
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
  const lang = replyLangFromCtx(seller, ctx);
  const txt = text.trim().toLowerCase();
  let method: PaymentMethod | null = null;
  const upiAvail = getUpiForSeller(seller);
  const rzpKeys = getRazorpayKeysForSeller(seller);

  if (txt === "1" || txt.includes("upi") || txt.includes("prepaid") || txt.includes("online") || txt.includes("card")) {
    if (upiAvail) method = "upi_manual";
    else if (rzpKeys) method = "razorpay";
    else if (seller.cod_enabled) {
      await sendMessage(
        phone,
        lang === "gujarati"
          ? "UPI સેટ નથી — કૅશ માટે 2 લખો."
          : lang === "hindi"
            ? "UPI सेट नहीं — COD के लिए 2 भेजें।"
            : "UPI isn't configured — reply 2 for cash on delivery.",
        seller
      );
      return;
    } else {
      await sendMessage(phone, t("upi_not_configured", lang), seller);
      return;
    }
  } else if (txt === "2" || txt.includes("cod") || txt.includes("cash")) {
    method = "cod";
  }

  if (method === "cod" && !seller.cod_enabled) {
    await sendMessage(phone, t("cod_disabled", lang), seller);
    return;
  }

  if (!method) {
    await sendMessage(phone, t("pick_payment", lang), seller);
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

  await sendMessage(phone, t("area_prompt", lang, { zoneHint }), seller);
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
  const lang = replyLangFromCtx(seller, ctx);
  const zones = seller.delivery_zones ?? [];
  const match = matchZone(text, zones);
  if (!match) {
    await sendMessage(
      phone,
      t("area_invalid", lang, {
        detail:
          zones.length > 0
            ? lang === "gujarati"
              ? `માન્ય ઝોન: ${zones.join(", ")}`
              : lang === "hindi"
                ? `वैध ज़ोन: ${zones.join(", ")}`
                : `Valid zones: ${zones.join(", ")}`
            : lang === "gujarati"
              ? "ફરી મોકલો."
              : lang === "hindi"
                ? "फिर भेजें."
                : "Try again.",
      }),
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

  await sendMessage(phone, t("address_prompt", lang, { area: match }), seller);
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

/** Customer replied while waiting for manual UPI confirmation. */
async function runAwaitingUpiConfirmation(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  seller: Seller,
  conversation: Conversation,
  phone: string,
  text: string,
  now: string,
  ctx: ConversationContext
) {
  const lang = replyLangFromCtx(seller, ctx);
  const raw = text.trim();
  const lower = raw.toLowerCase();
  const paidLike =
    /\bpaid\b/i.test(lower) ||
    /\butr\b/i.test(lower) ||
    /\butr[:#\s]/i.test(lower) ||
    /^done$/i.test(lower) ||
    /^pay\s*kar\s*diya/i.test(lower) ||
    /^pay\s*kar\s*didi/i.test(lower) ||
    /^ચૂકવણી\s*થઈ/i.test(raw) ||
    /^भुगतान\s*कर\s*दिया/i.test(lower);

  if (!paidLike) {
    const orderId = ctx.order_id;
    if (!orderId) {
      await sendMessage(phone, t("awaiting_payment_missing", lang), seller);
      return;
    }
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    const upi = getUpiForSeller(seller);
    if (!order || order.payment_method !== "upi_manual" || !upi) {
      await sendMessage(phone, t("awaiting_payment_missing", lang), seller);
      return;
    }
    const amt = order.total_amount ?? 0;
    const shortId = order.id.slice(0, 8);
    await sendMessage(
      phone,
      t("awaiting_upi_instructions", lang, {
        amount: String(amt),
        upi,
        shortId,
      }),
      seller
    );
    return;
  }

  const orderId = ctx.order_id;
  if (!orderId) {
    await sendMessage(phone, t("awaiting_payment_missing", lang), seller);
    return;
  }

  const { data: orderRow } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  const order = orderRow as Order | null;
  if (!order || order.seller_id !== seller.id || order.payment_method !== "upi_manual") {
    await sendMessage(phone, t("awaiting_payment_missing", lang), seller);
    return;
  }

  await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: now,
      status: "preparing",
    })
    .eq("id", order.id);

  await insertOrderEvent(supabase, {
    orderId: order.id,
    sellerId: seller.id,
    eventType: "customer_claimed_upi_paid",
    status: "preparing",
    paymentStatus: "paid",
    note: raw.slice(0, 500),
    source: "bot",
  });

  await supabase
    .from("conversations")
    .update({
      state: "complete",
      context: { ...ctx, order_id: order.id },
      last_message_at: now,
    })
    .eq("id", conversation.id);

  await sendMessage(phone, t("paid_ack_customer", lang), seller);
  void notifyOrderPush(
    seller.id,
    "Customer says paid (UPI)",
    `₹${order.total_amount ?? "?"} — ${order.id.slice(0, 8)}`
  );
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
  const lang = replyLangFromCtx(seller, ctx);
  const orderId = ctx.order_id;
  if (!orderId) {
    await sendMessage(phone, t("awaiting_payment_missing", lang), seller);
    return;
  }
  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!order?.razorpay_payment_link_url) {
    await sendMessage(phone, t("awaiting_payment_no_link", lang), seller);
    return;
  }
  await sendMessage(
    phone,
    t("payment_reminder", lang, {
      amount: String(order.total_amount ?? ""),
      url: order.razorpay_payment_link_url,
    }),
    seller
  );
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
