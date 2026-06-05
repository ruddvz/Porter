import type { ConversationContext, Seller } from "@/types";

/** Central WhatsApp copy for webhooks, cron, and dashboard quick actions. */

export function paymentReceivedMessage(): string {
  return "✅ Payment received! Your order is being packed. ~30 mins. 🛵";
}

export function paymentFailedMessage(): string {
  return "Payment nathi thayu. Ferthi payment link par try karo.";
}

export function orderStatusUpdateMessage(
  storeName: string,
  status: "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled",
  orderRef?: string,
): string {
  const ref = orderRef ? ` #${orderRef.slice(0, 8)}` : "";
  switch (status) {
    case "confirmed":
      return `✅ ${storeName}: Order${ref} confirmed. We're on it!`;
    case "preparing":
      return `👨‍🍳 ${storeName}: Order${ref} is being prepared.`;
    case "out_for_delivery":
      return `🛵 ${storeName}: Order${ref} is out for delivery!`;
    case "delivered":
      return `📦 ${storeName}: Order${ref} delivered. Thank you!`;
    case "cancelled":
      return `❌ ${storeName}: Order${ref} was cancelled. Reply if you need help.`;
    default:
      return `${storeName}: Order${ref} status updated.`;
  }
}

export const SELLER_QUICK_REPLIES = [
  "Your order is ready ✅",
  "Out of delivery area",
  "What's your address?",
] as const;

export function nudgeMessageForState(
  state: string,
  seller: Pick<Seller, "store_name" | "delivery_zones">,
  ctx: ConversationContext,
): string | null {
  const store = seller.store_name;
  if (state === "collecting_payment_method") {
    const items = ctx.items ?? [];
    const total = ctx.order_total ?? 0;
    if (!items.length) {
      return `Hi! 👋 Were you trying to order from ${store}?
Just send me your grocery list and I'll sort it out! 🛒
Example: '5kg aloo, 2L tael, amul butter'`;
    }
    const top = items.slice(0, 3).map((i) => `• ${i.product_name} — ${i.quantity} ${i.unit}`);
    return `Your order is still waiting! 🛒
${top.join("\n")}
💰 Total: ₹${total}

How do you want to pay?
1️⃣ Online (UPI/Card)
2️⃣ Cash on Delivery`;
  }
  if (state === "collecting_items") {
    return `Hi! 👋 Were you trying to order from ${store}?
Just send me your grocery list and I'll sort it out! 🛒
Example: '5kg aloo, 2L tael, amul butter'`;
  }
  if (state === "collecting_area") {
    const zones = (seller.delivery_zones ?? []).filter(Boolean).join(", ");
    return `Still there? 📍
Just tell me your delivery area to confirm your order.
${zones || "Send your area name."}`;
  }
  if (state === "collecting_address") {
    return `Almost done! 🏠
Just send your building name + flat/house number and your order is confirmed.`;
  }
  if (state === "awaiting_payment") {
    return `Still there? 💳
Your payment link is waiting — complete payment when you're ready, or reply if you need help.`;
  }
  if (state === "awaiting_upi_confirmation") {
    return `Still there? 💳
Reply when you've sent the UPI payment, or ask for help.`;
  }
  return null;
}
