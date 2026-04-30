import type { Seller } from "@/types";

const GRAPH_VERSION = "v19.0";

/** Sends a plain-text WhatsApp message via Meta Cloud API for the seller's number. */
export async function sendMessage(
  to: string,
  message: string,
  seller: Pick<Seller, "meta_phone_number_id" | "meta_access_token">
): Promise<void> {
  const phoneId = seller.meta_phone_number_id;
  const token = seller.meta_access_token;
  if (!phoneId || !token) {
    console.error("[meta-whatsapp] Missing meta_phone_number_id or meta_access_token for seller");
    return;
  }
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/^\+/, ""),
        type: "text",
        text: { body: message },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[meta-whatsapp] Send failed", res.status, errText);
    }
  } catch (e) {
    console.error("[meta-whatsapp] Send error", e);
  }
}
