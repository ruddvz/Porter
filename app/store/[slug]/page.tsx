import StorefrontClient, { type PublicProduct, type PublicStore } from "./StorefrontClient";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicStorePage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  if (!slug) notFound();

  const supabase = createSupabaseServiceRoleClient();
  const { data: stores, error: storeErr } = await supabase.rpc("get_public_store_by_slug", { sl: slug });
  if (storeErr || !stores?.length) notFound();

  const { data: products, error: prodErr } = await supabase.rpc("get_public_store_products", { sl: slug });
  if (prodErr) notFound();

  return <StorefrontClient store={stores[0] as PublicStore} products={(products ?? []) as PublicProduct[]} />;
}
