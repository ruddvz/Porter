import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  if (!slug) return apiErr("Missing slug", 400);

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_public_store_by_slug", { sl: slug });
  if (error) return apiErr(error.message, 500);
  if (!data?.length) return apiErr("Store not found", 404);

  return apiOk(data[0]);
}
