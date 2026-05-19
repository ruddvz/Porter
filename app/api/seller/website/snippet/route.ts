import { apiErr, apiOk } from "@/lib/api-json";
import { publicStoreUrl } from "@/lib/store-slug";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiErr("Unauthorized", 401);

  const { data: seller } = await supabase
    .from("sellers")
    .select("store_slug, store_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!seller?.store_slug) return apiErr("Store slug not set", 400);

  const url = publicStoreUrl(seller.store_slug);
  const appBase = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const buttonHtml = `<a href="${url}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 24px;background:#0F7A3A;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Order Online</a>`;

  return apiOk({
    storeUrl: url,
    buttonHtml,
    embedCatalog: `<!-- Porter catalog (Phase 3) -->\n<div id="porter-catalog"></div>\n<script src="${appBase}/widget.js" data-store="${seller.store_slug}" data-mode="catalog"></script>`,
  });
}
