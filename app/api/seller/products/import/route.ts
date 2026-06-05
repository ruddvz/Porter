import { apiErr, apiOk } from "@/lib/api-json";
import { checkGate } from "@/lib/plan-gates";
import { slugifyProductName, uniqueProductSlug } from "@/lib/product-slug";
import { adjustProductStock } from "@/lib/inventory";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

/** POST — import products from CSV text. Body: { csv: string } */
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id, plan").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  let body: { csv?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Invalid JSON", 400);
  }
  const text = body.csv?.trim();
  if (!text) return apiErr("csv required", 400);

  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return apiErr("CSV must include header and at least one row", 400);

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const priceIdx = header.indexOf("price");
  if (nameIdx < 0 || priceIdx < 0) return apiErr("CSV must include name and price columns", 400);

  const unitIdx = header.indexOf("unit");
  const stockIdx = header.indexOf("stock_quantity");
  const catIdx = header.indexOf("category");

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id);
  const existingCount = count ?? 0;

  const { data: existingProducts } = await supabase
    .from("products")
    .select("product_slug")
    .eq("seller_id", seller.id);
  const slugSet = new Set(
    (existingProducts ?? []).map((p) => p.product_slug).filter((s): s is string => !!s),
  );

  const errors: string[] = [];
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const name = cols[nameIdx]?.trim();
    const price = Number(cols[priceIdx]);
    if (!name) {
      errors.push(`Row ${i + 1}: missing name`);
      continue;
    }
    if (!Number.isFinite(price) || price < 0) {
      errors.push(`Row ${i + 1}: invalid price`);
      continue;
    }

    const gate = checkGate(seller, "products", { productCount: existingCount + imported + 1 });
    if (!gate.ok) {
      errors.push(`Row ${i + 1}: ${gate.reason}`);
      break;
    }

    const unit = unitIdx >= 0 ? cols[unitIdx]?.trim() || "piece" : "piece";
    const stock = stockIdx >= 0 ? Math.max(0, Math.floor(Number(cols[stockIdx]) || 0)) : 0;
    const category = catIdx >= 0 ? cols[catIdx]?.trim() || null : null;
    const baseSlug = slugifyProductName(name);
    const product_slug = uniqueProductSlug(baseSlug, slugSet);
    const listed = stock > 0;

    const { data: inserted, error } = await supabase
      .from("products")
      .insert({
        seller_id: seller.id,
        name,
        price,
        unit,
        stock_quantity: listed ? stock : 0,
        category,
        product_slug,
        is_active: listed,
        in_stock: listed,
      })
      .select("id")
      .single();

    if (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
      continue;
    }
    if (inserted?.id && stock > 0) {
      await adjustProductStock({
        sellerId: seller.id,
        productId: inserted.id as string,
        quantityChange: stock,
        reason: "csv_import",
      });
    }
    imported++;
  }

  return apiOk({ imported, errors });
}
