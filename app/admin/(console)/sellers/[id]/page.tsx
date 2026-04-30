import ImpersonateButton from "@/components/admin/ImpersonateButton";
import SellerDetailActions from "@/components/admin/SellerDetailActions";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSellerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  const { data: seller, error } = await supabase.from("sellers").select("*").eq("id", params.id).maybeSingle();
  if (error || !seller) notFound();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: products } = await supabase.from("products").select("*").eq("seller_id", seller.id);
  const inStock = (products ?? []).filter((p) => p.in_stock).length;
  const outStock = (products ?? []).length - inStock;

  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .eq("seller_id", seller.id)
    .order("last_message_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <Link href="/admin/sellers" className="text-sm text-porter-green-400 hover:underline">
        ← Sellers
      </Link>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md">
          <h1 className="text-heading">{seller.store_name}</h1>
          <p className="mt-2 text-body text-porter-text-secondary">{seller.city ?? "—"}</p>
          <p className="mt-2 text-mono text-porter-text-muted">{seller.whatsapp_number}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge kind="plan" variant={seller.plan === "growth" ? "growth" : "starter"} label={seller.plan} />
            <Badge kind="status" variant={seller.is_active ? "paid" : "unpaid"} label={seller.is_active ? "Active" : "Inactive"} />
          </div>
          <div className="mt-4 space-y-2 text-sm text-porter-text-secondary">
            <p>Meta phone ID: {seller.meta_phone_number_id ? "configured" : "not set"}</p>
            <p>Meta token: {seller.meta_access_token ? "configured" : "not set"}</p>
            <p>Razorpay: {seller.razorpay_key_id && seller.razorpay_key_secret ? "keys present" : "not configured"}</p>
          </div>
          <ImpersonateButton sellerId={seller.id} />
          <SellerDetailActions sellerId={seller.id} currentPlan={seller.plan} isActive={seller.is_active} />
        </Card>
        <Card padding="md">
          <h2 className="text-title">Inventory summary</h2>
          <p className="mt-2 text-body text-porter-text-secondary">Total products: {(products ?? []).length}</p>
          <p className="text-body text-porter-text-secondary">In stock: {inStock}</p>
          <p className="text-body text-porter-text-secondary">Out of stock: {outStock}</p>
        </Card>
      </div>

      <Card padding="md">
        <h2 className="text-title">Recent orders</h2>
        <div className="mt-4">
          <Table
            columns={[
              { key: "id", header: "ID", cell: (o) => <span className="text-mono text-porter-text-muted">{o.id.slice(0, 8)}</span> },
              { key: "cust", header: "Customer", cell: (o) => o.customer_name || "—" },
              { key: "total", header: "Total", cell: (o) => <span className="text-mono">₹{o.total_amount}</span> },
              { key: "st", header: "Status", cell: (o) => o.status },
            ]}
            rows={orders ?? []}
            getRowKey={(o) => o.id}
            emptyTitle="No orders"
            emptyDescription="This seller has no orders yet."
          />
        </div>
      </Card>

      <Card padding="md">
        <h2 className="text-title">Conversations</h2>
        <div className="mt-4">
          <Table
            columns={[
              { key: "phone", header: "Phone", cell: (c) => <span className="text-mono">{c.customer_phone}</span> },
              { key: "state", header: "State", cell: (c) => c.state },
              { key: "lm", header: "Last message", cell: (c) => (c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "—") },
              { key: "n", header: "Nudges", cell: (c) => String(c.nudge_count ?? 0) },
            ]}
            rows={convs ?? []}
            getRowKey={(c) => c.id}
            emptyTitle="No conversations"
            emptyDescription="—"
          />
        </div>
      </Card>
    </div>
  );
}
