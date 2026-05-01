import SellersTable from "./SellersTable";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function AdminSellersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; plan?: string; status?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createSupabaseAdminClient();
  let q = supabase.from("sellers").select("*", { count: "exact" });

  if (searchParams.status === "inactive") q = q.eq("is_active", false);
  else if (searchParams.status === "active") q = q.eq("is_active", true);

  if (searchParams.plan === "starter" || searchParams.plan === "growth") {
    q = q.eq("plan", searchParams.plan);
  }

  const term = searchParams.q?.trim();
  if (term) {
    q = q.or(`store_name.ilike.%${term}%,city.ilike.%${term}%,whatsapp_number.ilike.%${term}%`);
  }

  const { data: sellers, count, error } = await q.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    return <p className="text-porter-orange-500">Failed to load sellers: {error.message}</p>;
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading">Sellers</h1>
        <p className="mt-1 text-body text-porter-text-secondary">Search, filter, and open seller detail.</p>
      </div>
      <SellersTable sellers={sellers ?? []} page={page} totalPages={totalPages} />
    </div>
  );
}
