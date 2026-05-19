import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/** GET — recent inventory movements for seller. Query: ?limit=50&productId= */
export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  const url = new URL(req.url);
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50);
  const productId = url.searchParams.get("productId");

  let q = supabase
    .from("inventory_movements")
    .select("id, product_id, movement_type, quantity_change, reason, source, order_id, created_at, products(name)")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (productId) q = q.eq("product_id", productId);

  const { data, error } = await q;
  if (error) return apiErr(error.message, 500);
  return apiOk(data ?? []);
}
