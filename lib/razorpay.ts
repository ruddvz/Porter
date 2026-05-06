import type { Order } from "@/types";

/** Creates a Razorpay payment link for the seller account (Basic auth with seller keys). Retries transient failures. */
export async function createPaymentLink(params: {
  amountPaise: number;
  order: Pick<Order, "id" | "customer_name" | "customer_phone">;
  keyId: string;
  keySecret: string;
  callbackUrl?: string;
}): Promise<{ id: string; short_url: string } | null> {
  const { amountPaise, order, keyId, keySecret, callbackUrl } = params;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const body = {
    amount: amountPaise,
    currency: "INR",
    accept_partial: false,
    description: `Porter order ${order.id.slice(0, 8)}`,
    customer: {
      name: order.customer_name ?? "Customer",
      contact: order.customer_phone.replace(/^\+/, ""),
    },
    notify: { sms: true, email: false },
    reminder_enable: true,
    callback_url: callbackUrl,
    callback_method: "get",
    notes: { porter_order_id: order.id },
  };

  const delays = [0, 400, 1200];
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) await new Promise((r) => setTimeout(r, delays[attempt]));
    try {
      const res = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string; short_url: string };
        return { id: data.id, short_url: data.short_url };
      }
      const errBody = await res.text();
      const retryable = res.status >= 500 || res.status === 429;
      console.error("[razorpay] create link failed", res.status, errBody);
      if (!retryable || attempt === delays.length - 1) return null;
    } catch (e) {
      console.error("[razorpay] create link error", e);
      if (attempt === delays.length - 1) return null;
    }
  }
  return null;
}
