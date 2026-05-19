import { apiErr, apiOk } from "@/lib/api-json";
import { syncInventoryForOrderStatusChange, statusTriggersInventorySync } from "@/lib/order-inventory";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { OrderStatus } from "@/types";

export const runtime = "nodejs";

/** POST — apply inventory ledger after order status change. Body: { previousStatus, newStatus } */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  const orderId = params.id;
  const { data: order } = await supabase
    .from("orders")
    .select("id, seller_id, status")
    .eq("id", orderId)
    .eq("seller_id", seller.id)
    .maybeSingle();
  if (!order) return apiErr("Order not found", 404);

  let body: { previousStatus?: string; newStatus?: string };
  try {
    body = (await req.json()) as { previousStatus?: string; newStatus?: string };
  } catch {
    return apiErr("Invalid JSON", 400);
  }

  const newStatus = body.newStatus ?? order.status;
  const previousStatus = body.previousStatus ?? order.status;
  if (!statusTriggersInventorySync(newStatus as OrderStatus)) {
    return apiOk({ skipped: true });
  }

  const result = await syncInventoryForOrderStatusChange({
    sellerId: seller.id,
    orderId,
    previousStatus,
    newStatus,
  });
  if (!result.ok) return apiErr(result.error ?? "Inventory sync failed", 400);
  return apiOk({ ok: true });
}
