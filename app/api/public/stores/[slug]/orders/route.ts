import { apiErr, apiOk } from "@/lib/api-json";
import { createStorefrontOrder, type StorefrontOrderInput } from "@/lib/public-store-order";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  if (!slug) return apiErr("Missing slug", 400);

  const supabase = createSupabaseServiceRoleClient();
  const { data: stores, error } = await supabase.rpc("get_public_store_by_slug", { sl: slug });
  if (error) return apiErr(error.message, 500);
  if (!stores?.length) return apiErr("Store not found", 404);
  const store = stores[0] as { id: string; cod_enabled: boolean };

  let body: StorefrontOrderInput;
  try {
    body = (await req.json()) as StorefrontOrderInput;
  } catch {
    return apiErr("Invalid JSON", 400);
  }

  if (!body.customerName?.trim() || !body.customerPhone?.trim()) {
    return apiErr("customerName and customerPhone are required", 400);
  }
  if (!body.items?.length) return apiErr("items are required", 400);
  if (body.paymentMethod === "cod" && !store.cod_enabled) {
    return apiErr("COD is not enabled for this store", 400);
  }

  const result = await createStorefrontOrder(store.id, body);
  if (!result.ok) return apiErr(result.error, 400);

  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const trackUrl = result.trackSlug && base ? `${base}/track/${result.trackSlug}` : null;

  return apiOk({ orderId: result.orderId, trackUrl }, { status: 201 });
}
