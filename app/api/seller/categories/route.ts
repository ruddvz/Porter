import { apiErr, apiOk } from "@/lib/api-json";
import { slugifyStoreName } from "@/lib/store-slug";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("seller_id", seller.id)
    .order("sort_order")
    .order("name");
  if (error) return apiErr(error.message, 500);
  return apiOk(data ?? []);
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  let body: { name?: string; description?: string; sort_order?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Invalid JSON", 400);
  }
  const name = body.name?.trim();
  if (!name) return apiErr("name is required", 400);

  const slug = slugifyStoreName(name);
  const { data, error } = await supabase
    .from("categories")
    .insert({
      seller_id: seller.id,
      name,
      slug,
      description: body.description?.trim() || null,
      sort_order: body.sort_order ?? 0,
    })
    .select("*")
    .single();
  if (error) return apiErr(error.message, 400);
  return apiOk(data, { status: 201 });
}
