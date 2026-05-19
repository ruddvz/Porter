import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export type InventoryMovementType =
  | "stock_received"
  | "sale"
  | "reservation"
  | "reservation_released"
  | "manual_adjustment"
  | "return"
  | "damage"
  | "expired"
  | "transfer"
  | "correction";

export async function getProductStockSnapshot(sellerId: string, productId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("quantity_change")
    .eq("seller_id", sellerId)
    .eq("product_id", productId);

  let onHand = (movements ?? []).reduce((sum, m) => sum + Number(m.quantity_change), 0);
  if ((movements ?? []).length === 0) {
    const { data: product } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", productId)
      .maybeSingle();
    onHand = Number(product?.stock_quantity ?? 0);
  }

  const { data: reservations } = await supabase
    .from("stock_reservations")
    .select("quantity")
    .eq("seller_id", sellerId)
    .eq("product_id", productId)
    .eq("status", "active");

  const reserved = (reservations ?? []).reduce((sum, r) => sum + Number(r.quantity), 0);
  return { onHand, reserved, available: onHand - reserved };
}

export async function recordInventoryMovement(params: {
  sellerId: string;
  productId: string;
  movementType: InventoryMovementType;
  quantityChange: number;
  reason?: string;
  source?: string;
  orderId?: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("inventory_movements").insert({
    seller_id: params.sellerId,
    product_id: params.productId,
    movement_type: params.movementType,
    quantity_change: params.quantityChange,
    reason: params.reason ?? null,
    source: params.source ?? null,
    order_id: params.orderId ?? null,
  });
  if (error) return { ok: false as const, error: error.message };

  const snap = await getProductStockSnapshot(params.sellerId, params.productId);
  const qty = Math.max(0, Math.floor(snap.available));
  await supabase
    .from("products")
    .update({ stock_quantity: qty, in_stock: qty > 0 })
    .eq("id", params.productId);
  return { ok: true as const };
}

export async function reserveStockForOrder(params: {
  sellerId: string;
  orderId: string;
  items: { productId: string; quantity: number }[];
}) {
  const supabase = createSupabaseServiceRoleClient();
  for (const item of params.items) {
    const snap = await getProductStockSnapshot(params.sellerId, item.productId);
    if (snap.available < item.quantity) {
      return { ok: false as const, error: `Insufficient stock` };
    }
    const { error } = await supabase.from("stock_reservations").insert({
      seller_id: params.sellerId,
      product_id: item.productId,
      order_id: params.orderId,
      quantity: item.quantity,
      status: "active",
    });
    if (error) return { ok: false as const, error: error.message };
    const snapAfter = await getProductStockSnapshot(params.sellerId, item.productId);
    const qty = Math.max(0, Math.floor(snapAfter.available));
    await supabase.from("products").update({ stock_quantity: qty, in_stock: qty > 0 }).eq("id", item.productId);
  }
  return { ok: true as const };
}

export function stockDisplayLabel(available: number): string {
  if (available <= 0) return "Sold out";
  if (available <= 5) return `Only ${available} left`;
  return "In stock";
}
