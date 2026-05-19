import { apiErr, apiOk } from "@/lib/api-json";
import { getProductStockSnapshot, stockDisplayLabel } from "@/lib/inventory";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

/** GET — products at or below low_stock_threshold */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, stock_quantity, low_stock_threshold, in_stock, is_active, unit, price")
    .eq("seller_id", seller.id)
    .eq("is_active", true);

  if (error) return apiErr(error.message, 500);

  const low: {
    id: string;
    name: string;
    available: number;
    reserved: number;
    onHand: number;
    threshold: number;
    label: string;
  }[] = [];

  for (const p of products ?? []) {
    const threshold = p.low_stock_threshold ?? 5;
    const snap = await getProductStockSnapshot(seller.id, p.id);
    if (snap.available <= threshold) {
      low.push({
        id: p.id,
        name: p.name,
        available: snap.available,
        reserved: snap.reserved,
        onHand: snap.onHand,
        threshold,
        label: stockDisplayLabel(snap.available, threshold),
      });
    }
  }

  low.sort((a, b) => a.available - b.available);
  return apiOk(low);
}
