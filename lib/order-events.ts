import type { PaymentStatus } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderEventSource = "bot" | "dashboard" | "webhook" | "system";

/** Insert an audit row (service role or seller-scoped client). */
export async function insertOrderEvent(
  supabase: SupabaseClient,
  params: {
    orderId: string;
    sellerId: string;
    eventType: string;
    status?: string | null;
    paymentStatus?: PaymentStatus | string | null;
    note?: string | null;
    source?: OrderEventSource;
  }
) {
  const { error } = await supabase.from("order_events").insert({
    order_id: params.orderId,
    seller_id: params.sellerId,
    event_type: params.eventType,
    status: params.status ?? null,
    payment_status: params.paymentStatus ?? null,
    note: params.note ?? null,
    source: params.source ?? "system",
  });
  if (error) console.error("[order_events] insert", error);
}
