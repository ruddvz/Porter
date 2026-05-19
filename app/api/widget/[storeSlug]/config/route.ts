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

/** GET — embed config for widget.js (theme, store name, modes). */
export async function GET(_req: Request, { params }: { params: { storeSlug: string } }) {
  const slug = params.storeSlug?.trim();
  if (!slug) return apiErr("Missing store slug", 400);

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_public_store_by_slug", { sl: slug });
  if (error) return apiErr(error.message, 500);
  if (!data?.length) return apiErr("Store not found", 404);

  const store = data[0] as {
    store_name: string;
    store_slug: string;
    logo_url: string | null;
    cod_enabled: boolean;
    pickup_enabled: boolean;
    delivery_enabled: boolean;
  };

  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  const res = apiOk({
    storeSlug: slug,
    storeName: store.store_name,
    logoUrl: store.logo_url,
    storeUrl: `${base}/store/${slug}`,
    codEnabled: store.cod_enabled,
    pickupEnabled: store.pickup_enabled,
    deliveryEnabled: store.delivery_enabled,
    theme: {
      primary: "#0F7A3A",
      accent: "#F26B00",
      background: "#FFFAF2",
      text: "#111827",
    },
    modes: ["button", "catalog", "featured", "search", "cart"],
  });
  Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}
