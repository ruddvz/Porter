import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/** GET — products for embedded widget (same as public storefront). */
export async function GET(req: Request, { params }: { params: { storeSlug: string } }) {
  const slug = params.storeSlug?.trim();
  if (!slug) return apiErr("Missing store slug", 400);

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "48", 10) || 48);

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_public_store_products", { sl: slug });
  if (error) return apiErr(error.message, 500);

  let list = data ?? [];
  if (category) {
    list = list.filter(
      (p: { category?: string; category_slug?: string }) =>
        p.category_slug === category || p.category === category
    );
  }
  const res = apiOk(list.slice(0, limit));
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
