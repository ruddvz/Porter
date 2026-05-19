import { sendMessage as sendMetaMessage } from "@/lib/meta-whatsapp";
import { sendOpenWAText } from "@/lib/openwa-client";
import type { Seller } from "@/types";

export type WhatsAppProvider = "meta" | "openwa";

export function getWhatsAppProvider(seller: Pick<Seller, "whatsapp_provider">): WhatsAppProvider {
  return seller.whatsapp_provider === "openwa" ? "openwa" : "meta";
}

export async function sendMessage(
  to: string,
  message: string,
  seller: Pick<
    Seller,
    | "whatsapp_provider"
    | "openwa_session_id"
    | "meta_phone_number_id"
    | "meta_access_token"
    | "meta_access_token_enc"
  >
): Promise<boolean> {
  if (getWhatsAppProvider(seller) === "openwa") {
    const sessionId = seller.openwa_session_id;
    if (!sessionId) {
      console.error("[whatsapp] OpenWA provider but missing openwa_session_id");
      return false;
    }
    return sendOpenWAText(sessionId, to, message);
  }
  return sendMetaMessage(to, message, seller);
}
