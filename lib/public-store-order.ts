import { insertOrderEvent } from "@/lib/order-events";
import { reserveStockForOrder } from "@/lib/inventory";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export type StorefrontOrderItem = {
  productId: string;
  quantity: number;
};

export type StorefrontOrderInput = {
  customerName: string;
  customerPhone: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryArea?: string;
  deliveryAddress?: string;
  paymentMethod: "cod" | "razorpay";
  items: StorefrontOrderItem[];
  notes?: string;
};

export async function createStorefrontOrder(
  sellerId: string,
  input: StorefrontOrderInput
): Promise<{ ok: true; orderId: string; trackSlug: string | null } | { ok: false; error: string }> {
  const supabase = createSupabaseServiceRoleClient();

  const productIds = input.items.map((i) => i.productId);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, price, unit, stock_quantity, in_stock, is_active")
    .eq("seller_id", sellerId)
    .in("id", productIds);

  if (prodErr || !products?.length) return { ok: false, error: "Products not found" };

  const byId = new Map(products.map((p) => [p.id, p]));
  let total = 0;
  const lineItems: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_price: number;
  }[] = [];

  for (const item of input.items) {
    const p = byId.get(item.productId);
    if (!p || !p.is_active || !p.in_stock) return { ok: false, error: `Product unavailable: ${item.productId}` };
    const sq = p.stock_quantity ?? 0;
    if (sq < item.quantity) return { ok: false, error: `Insufficient stock for ${p.name}` };
    const unitPrice = Number(p.price);
    const lineTotal = unitPrice * item.quantity;
    total += lineTotal;
    lineItems.push({
      product_id: p.id,
      product_name: p.name,
      quantity: item.quantity,
      unit: p.unit,
      unit_price: unitPrice,
      total_price: lineTotal,
    });
  }

  const phone = input.customerPhone.replace(/\s/g, "");
  const { data: cust } = await supabase
    .from("customers")
    .upsert(
      {
        seller_id: sellerId,
        phone_number: phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`,
        name: input.customerName,
        default_area: input.deliveryArea ?? null,
        default_address: input.deliveryAddress ?? null,
      },
      { onConflict: "seller_id,phone_number" }
    )
    .select("id")
    .single();

  const paymentStatus = input.paymentMethod === "cod" ? "cod_pending" : "unpaid";
  const orderStatus = input.paymentMethod === "cod" ? "confirmed" : "pending";

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      seller_id: sellerId,
      customer_id: cust?.id ?? null,
      customer_name: input.customerName,
      customer_phone: phone,
      delivery_area: input.deliveryArea ?? null,
      delivery_address: input.deliveryAddress ?? null,
      total_amount: total,
      status: orderStatus,
      payment_method: input.paymentMethod,
      payment_status: paymentStatus,
      order_source: "storefront",
      fulfillment_type: input.fulfillmentType,
      notes: input.notes ?? null,
    })
    .select("id, track_public_slug")
    .single();

  if (orderErr || !order) return { ok: false, error: orderErr?.message ?? "Order failed" };

  await supabase.from("order_items").insert(
    lineItems.map((li) => ({
      order_id: order.id,
      seller_id: sellerId,
      product_id: li.product_id,
      product_name: li.product_name,
      quantity: li.quantity,
      unit: li.unit,
      unit_price: li.unit_price,
      total_price: li.total_price,
    }))
  );

  const reserve = await reserveStockForOrder({
    sellerId,
    orderId: order.id,
    items: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });
  if (!reserve.ok) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    return { ok: false, error: reserve.error ?? "Stock reservation failed" };
  }

  await insertOrderEvent(supabase, {
    orderId: order.id,
    sellerId,
    eventType: "order_created",
    status: orderStatus,
    paymentStatus,
    source: "storefront",
  });

  return {
    ok: true,
    orderId: order.id,
    trackSlug: (order as { track_public_slug?: string }).track_public_slug ?? null,
  };
}
