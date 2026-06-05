import { apiErr } from "@/lib/api-json";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function csvEscape(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** GET — download products as CSV for this seller. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id, store_name").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  const { data: products, error } = await supabase
    .from("products")
    .select("name, price, unit, stock_quantity, category, product_slug, is_active, in_stock")
    .eq("seller_id", seller.id)
    .order("sort_order", { ascending: true });
  if (error) return apiErr(error.message, 500);

  const header = "name,price,unit,stock_quantity,category,product_slug,is_active,in_stock";
  const rows = (products ?? []).map((p) =>
    [
      csvEscape(p.name),
      csvEscape(p.price),
      csvEscape(p.unit),
      csvEscape(p.stock_quantity),
      csvEscape(p.category),
      csvEscape(p.product_slug),
      csvEscape(p.is_active),
      csvEscape(p.in_stock),
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const filename = `porter-products-${(seller.store_name as string).replace(/\s+/g, "-").toLowerCase()}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
