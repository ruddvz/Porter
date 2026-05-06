import type { BotLanguagePreference } from "@/types";

export type ReplyLang = "gujarati" | "hindi" | "english";

/** Normalizes seller.bot_language to a known preference (defaults to auto). */
export function normalizeBotLanguagePref(pref: unknown): BotLanguagePreference {
  return pref === "gujarati" || pref === "hindi" || pref === "english" || pref === "auto" ? pref : "auto";
}

/** Lightweight script/heuristic detection for auto mode (best-effort). */
export function detectLangFromText(text: string): ReplyLang {
  const t = text.trim();
  if (!t) return "english";
  let gu = 0;
  let hi = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c >= 0x0a80 && c <= 0x0aff) gu++;
    if (c >= 0x0900 && c <= 0x097f) hi++;
  }
  if (gu > hi && gu >= 2) return "gujarati";
  if (hi > gu && hi >= 2) return "hindi";
  const lower = t.toLowerCase();
  if (/[ક-હ]|કેમ|તમે|ચો|મોકલો|હેલો/.test(t)) return "gujarati";
  if (/[क-ह]|कैसे|नमस्ते|भेजें|हेलो/.test(t)) return "hindi";
  if (/\b(kem|cho|moklo|tamaro|haan|nathi|samajyu|ferthi|tamari)\b/i.test(lower)) {
    return "gujarati";
  }
  if (/\b(kaise|namaste|bhejen|aapka|nahi|samajh)\b/i.test(lower)) {
    return "hindi";
  }
  return "english";
}

/** Effective reply language for this message (respects auto vs fixed seller pref). */
export function replyLangForMessage(pref: BotLanguagePreference, customerText: string): ReplyLang {
  if (pref === "auto") return detectLangFromText(customerText);
  return pref === "gujarati" || pref === "hindi" ? pref : "english";
}

type Bundle = Record<
  | "parse_failed"
  | "welcome_repeat"
  | "welcome_first_suffix"
  | "question_reply"
  | "other_reply"
  | "same_order_missing"
  | "cod_disabled"
  | "pick_payment"
  | "upi_not_configured"
  | "area_prompt"
  | "area_invalid"
  | "address_prompt"
  | "online_pending"
  | "order_save_failed"
  | "payment_link_failed"
  | "awaiting_payment_missing"
  | "awaiting_payment_no_link"
  | "monthly_order_cap"
  | "payment_reminder"
  | "off_hours_closed"
  | "min_order_not_met"
  | "awaiting_upi_instructions"
  | "paid_ack_customer",
  string
>;

const BUNDLES: Record<ReplyLang, Bundle> = {
  english: {
    parse_failed: "Didn't catch that — please send your list again (Gujarati / Hindi / English).",
    welcome_repeat: "Welcome back! 👋 Send your list anytime — I'm ready. 🛒",
    welcome_first_suffix:
      "\n\nI'm your order assistant. Here's how to order:\n\n📝 Just type your list:\n'5kg potatoes, 2L oil, butter'\n\nI understand Gujarati, Hindi and English!",
    question_reply:
      "Hi! For pricing and availability, send the item name and I'll help.{phoneLine}\nTo order, send your full list! 🛒",
    other_reply:
      "Hi! I'm the order bot for {store}. 🤖\nSend your grocery list to place an order.\nExample: '5kg potatoes, butter, 2L oil'",
    same_order_missing: "I don't have a previous order for you. Send me your list!",
    cod_disabled: "Cash on delivery isn't available for this store. Reply 1 for UPI prepay.",
    pick_payment: "How do you want to pay?\n1️⃣ UPI (pay to our ID, then reply PAID)\n2️⃣ Cash on delivery\n\nReply 1 or 2",
    upi_not_configured: "UPI payment isn't set up on this store yet. Reply 2 for cash on delivery, or call the shop.",
    area_prompt: "Send your area (building / society name optional).{zoneHint}",
    area_invalid: "Couldn't match the area. {detail}",
    address_prompt: "Got it — {area}. Please send your full address (building + flat).",
    online_pending: "Online payment via payment link isn't set up. Use UPI manual or cash, or call the store.",
    order_save_failed: "We couldn't save the order. Please try again.",
    payment_link_failed: "Payment link could not be created. Please try again.",
    awaiting_payment_missing: "We couldn't find that order. Please send your list again.",
    awaiting_payment_no_link: "No payment link on file. Please contact the store.",
    monthly_order_cap: "You've reached the order limit for this month.",
    payment_reminder: "Pay ₹{amount} here 👇\n{url}",
    off_hours_closed:
      "{store} is closed right now. We'll be back during opening hours — send your order again then!",
    min_order_not_met: "Minimum order is ₹{min}. Your cart is ₹{total}. Add more items and try again.",
    awaiting_upi_instructions:
      "💳 Pay ₹{amount} to UPI: *{upi}*\nUse any UPI app. After paying, reply *PAID* or send your UTR.\nOrder ref: #{shortId}",
    paid_ack_customer:
      "Thanks! We've notified the shop. They'll confirm your payment shortly.",
  },
  gujarati: {
    parse_failed: "સમજાયું નથી — ફરી તમારી લિસ્ટ મોકલો (ગુજરાતી / હિન્દી / English).",
    welcome_repeat: "ફરી સ્વાગત! 👋 ક્યારે પણ લિસ્ટ મોકલો — હું તૈયાર છું. 🛒",
    welcome_first_suffix:
      "\n\nહું તમારો ઓર્ડર સહાયક છું. કેવી રીતે ઓર્ડર કરવું:\n\n📝 ફક્ત લિસ્ટ લખો:\n'5kg બટાકા, 2L તલ, માખણ'\n\nમને ગુજરાતી, હિન્દી અને English સમજાય છે!",
    question_reply:
      "હાય! ભાવ અથવા ઉપલબ્ધતા માટે વસ્તુનું નામ મોકલો.{phoneLine}\nઓર્ડર માટે પૂરી લિસ્ટ મોકલો! 🛒",
    other_reply:
      "હાય! હું {store} માટે ઓર્ડર બોટ છું. 🤖\nઓર્ડર માટે તમારી લિસ્ટ મોકલો.\nઉદાહરણ: '5kg બટાકા, માખણ, 2L તલ'",
    same_order_missing: "તમારો પહેલાનો ઓર્ડર મળતો નથી. લિસ્ટ મોકલો!",
    cod_disabled: "આ સ્ટોર પર COD નથી. UPI માટે 1 લખો.",
    pick_payment: "કેવી રીતે ચૂકવણી?\n1️⃣ UPI (ચૂકવણી કરીને PAID લખો)\n2️⃣ કૅશ ઑન ડિલિવરી\n\n1 અથવા 2",
    upi_not_configured: "આ સ્ટોર પર UPI સેટ નથી. COD માટે 2 લખો અથવા કૉલ કરો.",
    area_prompt: "તમારો એરિયા મોકલો (બિલ્ડિંગ / સોસાયટી વૈકલ્પિક).{zoneHint}",
    area_invalid: "એરિયા મેચ થયો નથી. {detail}",
    address_prompt: "બરાબર — {area}. સંપૂર્ણ એડ્રેસ મોકલો (બિલ્ડિંગ + ફ્લેટ).",
    online_pending: "પેમેન્ટ લિંક સેટ નથી. UPI અથવા કૅશ વાપરો.",
    order_save_failed: "ઓર્ડર સાચવાતો નથી. ફરી પ્રયાસ કરો.",
    payment_link_failed: "પેમેન્ટ લિંક ન બની શકી. ફરી પ્રયાસ કરો.",
    awaiting_payment_missing: "ઓર્ડર મળતો નથી. ફરી લિસ્ટ મોકલો.",
    awaiting_payment_no_link: "પેમેન્ટ લિંક નથી. સ્ટોરનો સંપર્ક કરો.",
    monthly_order_cap: "આ મહિનાનો ઓર્ડર મર્યાદા સમાપ્ત.",
    payment_reminder: "₹{amount} અહીં ચૂકવો 👇\n{url}",
    off_hours_closed: "{store} હમણાં બંધ છે. ખુલવાના સમયે ફરી ઓર્ડર મોકલો!",
    min_order_not_met: "ન્યૂનતમ ઓર્ડર ₹{min} છે. તમારી લિસ્ટ ₹{total}. વધુ વસ્તુઓ ઉમેરો.",
    awaiting_upi_instructions:
      "💳 ₹{amount} UPI પર મોકલો: *{upi}*\nચૂકવણી પછી *PAID* અથવા UTR મોકલો.\nઓર્ડર #{shortId}",
    paid_ack_customer: "આભાર! દુકાનને જાણ કરી દીધી — તેઓ ટૂંકમાં કન્ફર્મ કરશે.",
  },
  hindi: {
    parse_failed: "समझ नहीं आया — कृपया अपनी सूची फिर भेजें (गुजराती / हिंदी / English)।",
    welcome_repeat: "वापस स्वागत! 👋 कभी भी सूची भेजें — मैं तैयार हूँ। 🛒",
    welcome_first_suffix:
      "\n\nमैं आपका ऑर्डर सहायक हूँ। ऑर्डर कैसे करें:\n\n📝 सूची भेजें:\n'5kg आलू, 2L तेल, मक्खन'\n\nमुझे गुजराती, हिंदी और English समझ आती है!",
    question_reply:
      "नमस्ते! दाम और उपलब्धता के लिए वस्तु का नाम भेजें।{phoneLine}\nऑर्डर के लिए पूरी सूची भेजें! 🛒",
    other_reply:
      "नमस्ते! मैं {store} के लिए ऑर्डर बॉट हूँ। 🤖\nऑर्डर के लिए अपनी सूची भेजें।\nउदाहरण: '5kg आलू, मक्खन, 2L तेल'",
    same_order_missing: "पिछला ऑर्डर नहीं मिला। सूची भेजें!",
    cod_disabled: "इस स्टोर पर COD नहीं। UPI के लिए 1 भेजें।",
    pick_payment: "कैसे भुगतान?\n1️⃣ UPI (भुगतान करके PAID लिखें)\n2️⃣ कैश ऑन डिलिवरी\n\n1 या 2",
    upi_not_configured: "इस स्टोर पर UPI सेट नहीं है। COD के लिए 2 या कॉल करें।",
    area_prompt: "अपना एरिया भेजें (बिल्डिंग / सोसायटी वैकल्पिक)।{zoneHint}",
    area_invalid: "एरिया मैच नहीं हुआ। {detail}",
    address_prompt: "ठीक — {area}। पूरा पता भेजें (बिल्डिंग + फ्लैट)।",
    online_pending: "पेमेंट लिंक सेट नहीं। UPI या कैश उपयोग करें।",
    order_save_failed: "ऑर्डर सेव नहीं हुआ। फिर कोशिश करें।",
    payment_link_failed: "पेमेंट लिंक नहीं बन सका। फिर कोशिश करें।",
    awaiting_payment_missing: "ऑर्डर नहीं मिला। सूची फिर भेजें।",
    awaiting_payment_no_link: "पेमेंट लिंक नहीं है। स्टोर से संपर्क करें।",
    monthly_order_cap: "इस महीने का ऑर्डर लिमिट पूरा हो गया।",
    payment_reminder: "₹{amount} यहाँ भुगतान करें 👇\n{url}",
    off_hours_closed: "{store} अभी बंद है। खुलने के बाद फिर ऑर्डर भेजें!",
    min_order_not_met: "न्यूनतम ऑर्डर ₹{min} है। आपकी लिस्ट ₹{total} है। और आइटम जोड़ें।",
    awaiting_upi_instructions:
      "💳 ₹{amount} इस UPI पर भेजें: *{upi}*\nभुगतान के बाद *PAID* या UTR भेजें।\nऑर्डर #{shortId}",
    paid_ack_customer: "धन्यवाद! दुकान को सूचना दे दी गई है।",
  },
};

function applyTemplate(s: string, vars: Record<string, string>): string {
  let out = s;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(v);
  }
  return out;
}

export function t(
  key: keyof Bundle,
  lang: ReplyLang,
  vars: Record<string, string> = {}
): string {
  return applyTemplate(BUNDLES[lang][key] ?? BUNDLES.english[key], vars);
}

export function formatPartialPaymentPrompt(
  lang: ReplyLang,
  lines: string,
  total: number,
  zone: string,
  address: string
): string {
  const base = `${lines}\n💰 Total: ₹${total}\n📍 ${zone} — ${address}`;
  if (lang === "gujarati") {
    return `સમજાયું!\n${base}\n\nકેવી રીતે ચૂકવણી?\n1️⃣ UPI\n2️⃣ કૅશ ઑન ડિલિવરી`;
  }
  if (lang === "hindi") {
    return `समझ गया!\n${base}\n\nकैसे भुगतान?\n1️⃣ UPI\n2️⃣ कैश ऑन डिलिवरी`;
  }
  return `Got it!\n${base}\n\nHow to pay?\n1️⃣ UPI\n2️⃣ Cash on delivery`;
}

export function formatOrderConfirmedPrepaid(
  lang: ReplyLang,
  summary: string,
  area: string,
  address: string,
  total: number,
  linkUrl: string,
  storeName: string
): string {
  const header =
    lang === "gujarati"
      ? "✅ ઓર્ડર કન્ફર્મ!"
      : lang === "hindi"
        ? "✅ ऑर्डर कन्फर्म!"
        : "✅ Order confirmed!";
  const footer =
    lang === "gujarati"
      ? `\n\n*Porter — ${storeName}*`
      : lang === "hindi"
        ? `\n\n*Porter — ${storeName}*`
        : `\n\n*Porter — ${storeName}*`;
  return `${header}\n${summary}\n📍 ${area} — ${address}\n💰 Total: ₹${total}\n${linkUrl}${footer}`;
}

export function formatOrderConfirmedUpiManual(
  lang: ReplyLang,
  summary: string,
  area: string,
  address: string,
  total: number,
  upi: string,
  shortId: string,
  storeName: string
): string {
  const header =
    lang === "gujarati"
      ? "✅ ઓર્ડર મળ્યો!"
      : lang === "hindi"
        ? "✅ ऑर्डर मिला!"
        : "✅ Order received!";
  const pay =
    lang === "gujarati"
      ? `💳 ₹${total} — UPI: ${upi}\nપછી *PAID* લખો (#${shortId})`
      : lang === "hindi"
        ? `💳 ₹${total} — UPI: ${upi}\nफिर *PAID* भेजें (#${shortId})`
        : `💳 Pay ₹${total} to UPI: ${upi}\nThen reply *PAID* (ref #${shortId})`;
  return `${header}\n${summary}\n📍 ${area} — ${address}\n${pay}\n\n*Porter — ${storeName}*`;
}

export function formatOrderConfirmedCod(
  lang: ReplyLang,
  summary: string,
  area: string,
  address: string,
  total: number,
  storeName: string
): string {
  const header =
    lang === "gujarati"
      ? "✅ ઓર્ડર કન્ફર્મ!"
      : lang === "hindi"
        ? "✅ ऑर्डर कन्फर्म!"
        : "✅ Order confirmed!";
  const codLine =
    lang === "gujarati"
      ? `કૅશ ઑન ડિલિવરી — રાઇડરને ₹${total} આપો`
      : lang === "hindi"
        ? `कैश ऑन डिलिवरी — राइडर को ₹${total} दें`
        : `Cash on delivery — pay rider ₹${total}`;
  return `${header}\n${summary}\n📍 ${area} — ${address}\n💰 Total: ₹${total}\n${codLine}\n\n*Porter — ${storeName}*`;
}

export function formatSameOrderPaymentPrompt(
  lang: ReplyLang,
  linesJoined: string,
  total: number,
  zone: string,
  address: string
): string {
  const base = `${linesJoined}\n💰 Total: ₹${total}\n📍 ${zone} — ${address}`;
  if (lang === "gujarati") {
    return `જૂનો ઓર્ડર લોડ થયો!\n${base}\n\nકેવી રીતે ચૂકવણી?\n1️⃣ UPI\n2️⃣ કૅશ ઑન ડિલિવરી`;
  }
  if (lang === "hindi") {
    return `पिछला ऑर्डर लोड हो गया!\n${base}\n\nकैसे भुगतान?\n1️⃣ UPI\n2️⃣ कैश ऑन डिलिवरी`;
  }
  return `Same order loaded!\n${base}\n\nHow to pay?\n1️⃣ UPI\n2️⃣ Cash on delivery`;
}

export function formatOrderSummaryPrompt(
  lang: ReplyLang,
  lines: string,
  total: number,
  zoneHint: string,
  codChoice: boolean
): string {
  const header =
    lang === "gujarati"
      ? "સમજાયું! તમારો ઓર્ડર:"
      : lang === "hindi"
        ? "समझ गया! आपका ऑर्डर:"
        : "Got it! Here's your order:";
  const payOnly =
    lang === "gujarati"
      ? "\n\nઆ સ્ટોર પર ફક્ત UPI પ્રીપે કરો."
      : lang === "hindi"
        ? "\n\nइस स्टोर पर केवल UPI प्रीपे."
        : "\n\nThis store only accepts UPI prepay for online orders.";
  const area =
    lang === "gujarati"
      ? "\n\nતમારો એરિયા મોકલો."
      : lang === "hindi"
        ? "\n\nअपना एरिया भेजें."
        : "\n\nSend your area.";
  const codMsg =
    lang === "gujarati"
      ? `\n\nકેવી રીતે ચૂકવણી?\n1️⃣ UPI — પહેલાં ચૂકવણી\n2️⃣ કૅશ ઑન ડિલિવરી\n\n1 અથવા 2 લખો`
      : lang === "hindi"
        ? `\n\nकैसे भुगतान?\n1️⃣ UPI — पहले भुगतान\n2️⃣ कैश ऑन डिलिवरी\n\n1 या 2 भेजें`
        : `\n\nHow do you want to pay?\n1️⃣ UPI — pay first\n2️⃣ Cash on delivery\n\nReply 1 or 2`;

  if (!codChoice) {
    return `${header}\n${lines}\n💰 Total: ₹${total}${payOnly}${zoneHint}${area}`;
  }
  return `${header}\n${lines}\n💰 Total: ₹${total}${codMsg}`;
}

export function firstWelcomeBody(storeName: string, zones: string, lang: ReplyLang): string {
  const z = zones || "—";
  if (lang === "gujarati") {
    return `કેમ છો! 👋 ${storeName} પર Porter માં સ્વાગત.

મારી પાસે ઓર્ડર કેવી રીતે કરવા:

📝 ફક્ત લિસ્ટ લખો:
'5kg બટાકા, 2 લિટર તલ, માખણ'

મને ગુજરાતી, હિન્દી અને English સમજાય છે!

ડિલિવરી એરિયા: ${z}
ચૂકવણી: મુખ્યત્વે UPI અથવા કૅશ ઑન ડિલિવરી

જ્યારે તૈયાર હો ત્યારે લિસ્ટ મોકલો 🛒`;
  }
  if (lang === "hindi") {
    return `नमस्ते! 👋 ${storeName} पर Porter में स्वागत.

ऑर्डर कैसे करें:

📝 सूची भेजें:
'5kg आलू, 2 लीटर तेल, मक्खन'

मुझे गुजराती, हिंदी और English समझ आती है!

डिलीवरी एरिया: ${z}
भुगतान: ज़्यादातर UPI या कैश ऑन डिलिवरी

जब तैयार हों, सूची भेजें 🛒`;
  }
  return `Kem cho! 👋 Welcome to ${storeName} on Porter.

I'm your order assistant. Here's how to order:

📝 Just type your list:
'5kg potatoes, 2L oil, butter'

I understand Gujarati, Hindi and English!

Delivery areas: ${z}
Payment: Mostly UPI or cash on delivery

Send your list whenever you're ready 🛒`;
}
