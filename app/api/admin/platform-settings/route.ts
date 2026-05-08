import { apiErr, apiOk } from "@/lib/api-json";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return apiErr("Forbidden", 403, "403");

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("platform_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return apiErr(error.message, 500);
  return apiOk(data);
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401, "401");
  const { data: isAdmin } = await supabase.rpc("is_platform_admin");
  if (!isAdmin) return apiErr("Forbidden", 403, "403");

  let body: Partial<{
    starter_product_limit: number;
    starter_orders_per_month: number;
    starter_analytics_days: number;
    growth_analytics_days: number;
    announcement: string | null;
  }>;
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Bad JSON", 400);
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("platform_settings")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return apiErr(error.message, 500);
  return apiOk({ saved: true });
}
