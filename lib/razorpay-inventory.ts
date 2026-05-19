import { commitSaleForOrder } from "@/lib/inventory";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Seller } from "@/types";

/**
 * After Razorpay marks an order paid, optionally commit inventory:
 * - If seller has auto_commit_inventory_on_payment
 * - Or order was already marked delivered before payment cleared
 */
export async function maybeCommitInventoryAfterPayment(orderId: string, seller: Seller): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, seller_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  const autoOnPayment = seller.auto_commit_inventory_on_payment === true;
  const alreadyDelivered = order.status === "delivered";

  if (autoOnPayment || alreadyDelivered) {
    await commitSaleForOrder(order.seller_id as string, orderId);
  }
}
