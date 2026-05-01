import AdminOrdersTable from "./AdminOrdersTable";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const pageSize = 30;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createSupabaseAdminClient();
  const { data: orders, count, error } = await supabase
    .from("orders")
    .select("*, sellers(store_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return <p className="text-porter-orange-500">{error.message}</p>;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading">Platform orders</h1>
        <p className="mt-1 text-body text-porter-text-secondary">All sellers — newest first.</p>
      </div>
      <AdminOrdersTable orders={orders ?? []} page={page} totalPages={totalPages} />
    </div>
  );
}
