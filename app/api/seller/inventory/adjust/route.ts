import { apiErr, apiOk } from "@/lib/api-json";
import { adjustProductStock } from "@/lib/inventory";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/** POST — manual stock adjustment with ledger. Body: { productId, quantityChange, reason? } */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  let body: { productId?: string; quantityChange?: number; reason?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Invalid JSON", 400);
  }

  if (!body.productId || body.quantityChange == null || body.quantityChange === 0) {
    return apiErr("productId and non-zero quantityChange required", 400);
  }

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", body.productId)
    .eq("seller_id", seller.id)
    .maybeSingle();
  if (!product) return apiErr("Product not found", 404);

  const result = await adjustProductStock({
    sellerId: seller.id,
    productId: body.productId,
    quantityChange: body.quantityChange,
    reason: body.reason,
  });
  if (!result.ok) return apiErr(result.error ?? "Adjust failed", 400);
  return apiOk({ ok: true });
}
