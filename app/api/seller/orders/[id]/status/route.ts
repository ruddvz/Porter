import { apiErr, apiOk } from "@/lib/api-json";
import { insertOrderEvent } from "@/lib/order-events";
import { canTransitionOrderStatus } from "@/lib/order-status-transitions";
import { syncInventoryForOrderStatusChange } from "@/lib/order-inventory";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { OrderStatus } from "@/types";

export const runtime = "nodejs";

/** PATCH — update order status with transition rules. Body: { status, ...optional fields } */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  let body: {
    status?: OrderStatus;
    payment_status?: string;
    payment_method?: string;
    delivered_at?: string;
    paid_at?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Invalid JSON", 400);
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .eq("seller_id", seller.id)
    .maybeSingle();
  if (!order) return apiErr("Order not found", 404);

  const updates: Record<string, unknown> = {};
  if (body.status && body.status !== order.status) {
    if (!canTransitionOrderStatus(order.status as OrderStatus, body.status)) {
      return apiErr(`Invalid status transition: ${order.status} → ${body.status}`, 400);
    }
    updates.status = body.status;
  }
  if (body.payment_status != null) updates.payment_status = body.payment_status;
  if (body.payment_method != null) updates.payment_method = body.payment_method;
  if (body.delivered_at != null) updates.delivered_at = body.delivered_at;
  if (body.payment_status === "paid" && !updates.paid_at) updates.paid_at = new Date().toISOString();

  if (Object.keys(updates).length === 0) return apiOk({ ok: true });

  const prevStatus = order.status as OrderStatus;
  const { error } = await supabase.from("orders").update(updates).eq("id", order.id);
  if (error) return apiErr(error.message, 500);

  if (updates.status && updates.status !== prevStatus) {
    await syncInventoryForOrderStatusChange({
      orderId: order.id as string,
      sellerId: seller.id,
      previousStatus: prevStatus,
      newStatus: updates.status as string,
    });
    await insertOrderEvent(supabase, {
      orderId: order.id as string,
      sellerId: seller.id,
      eventType: "status_changed_dashboard",
      status: updates.status as string,
      paymentStatus: (updates.payment_status as string) ?? (order.payment_status as string),
      note: `${prevStatus} → ${updates.status}`,
      source: "dashboard",
    });
  }

  return apiOk({ ok: true });
}
