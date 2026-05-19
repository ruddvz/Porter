import { apiErr, apiOk } from "@/lib/api-json";
import { slugifyStoreName } from "@/lib/store-slug";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  let body: { name?: string; description?: string; sort_order?: number; is_active?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return apiErr("Invalid JSON", 400);
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) {
    updates.name = body.name.trim();
    updates.slug = slugifyStoreName(body.name);
  }
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", params.id)
    .eq("seller_id", seller.id)
    .select("*")
    .single();
  if (error) return apiErr(error.message, 400);

  if (body.name && data) {
    await supabase.from("products").update({ category: data.name }).eq("seller_id", seller.id).eq("category_id", params.id);
  }

  return apiOk(data);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).maybeSingle();
  if (!seller) return apiErr("No seller profile", 400);

  const { error } = await supabase.from("categories").delete().eq("id", params.id).eq("seller_id", seller.id);
  if (error) return apiErr(error.message, 400);
  return apiOk({ ok: true });
}
