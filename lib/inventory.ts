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

export async function releaseReservationsForOrder(sellerId: string, orderId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data: rows, error } = await supabase
    .from("stock_reservations")
    .select("id, product_id")
    .eq("seller_id", sellerId)
    .eq("order_id", orderId)
    .eq("status", "active");
  if (error) return { ok: false as const, error: error.message };
  if (!rows?.length) return { ok: true as const };

  for (const row of rows) {
    await supabase
      .from("stock_reservations")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", row.id);
    const snap = await getProductStockSnapshot(sellerId, row.product_id);
    const qty = Math.max(0, Math.floor(snap.available));
    await supabase.from("products").update({ stock_quantity: qty, in_stock: qty > 0 }).eq("id", row.product_id);
  }
  return { ok: true as const };
}

export async function commitSaleForOrder(sellerId: string, orderId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data: rows, error } = await supabase
    .from("stock_reservations")
    .select("id, product_id, quantity")
    .eq("seller_id", sellerId)
    .eq("order_id", orderId)
    .eq("status", "active");
  if (error) return { ok: false as const, error: error.message };
  if (!rows?.length) return { ok: true as const };

  for (const row of rows) {
    await supabase.from("stock_reservations").update({ status: "committed" }).eq("id", row.id);
    await recordInventoryMovement({
      sellerId,
      productId: row.product_id,
      movementType: "sale",
      quantityChange: -Number(row.quantity),
      reason: "Order fulfilled",
      source: "order",
      orderId,
    });
  }
  return { ok: true as const };
}

/** Manual stock add/remove with ledger entry. */
export async function adjustProductStock(params: {
  sellerId: string;
  productId: string;
  quantityChange: number;
  reason?: string;
  movementType?: InventoryMovementType;
}) {
  const type = params.movementType ?? (params.quantityChange >= 0 ? "stock_received" : "manual_adjustment");
  return recordInventoryMovement({
    sellerId: params.sellerId,
    productId: params.productId,
    movementType: type,
    quantityChange: params.quantityChange,
    reason: params.reason ?? "Manual adjustment",
    source: "manual",
  });
}

export function stockDisplayLabel(available: number, threshold = 5): string {
  if (available <= 0) return "Sold out";
  if (available <= threshold) return `Only ${available} left`;
  return "In stock";
}
