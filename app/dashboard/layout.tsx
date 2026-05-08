import ShopDashboardShell from "@/components/dashboard/ShopDashboardShell";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cookieStore = await cookies();
  const impersonateSellerId = cookieStore.get("porter_admin_impersonate")?.value ?? null;

  let seller = null as import("@/types").Seller | null;
  let impersonating = false;

  if (impersonateSellerId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createSupabaseAdminClient();
      const { data: adminRow } = await admin.from("admin_users").select("id").eq("user_id", user.id).maybeSingle();
      if (adminRow) {
        const { data: s } = await admin.from("sellers").select("*").eq("id", impersonateSellerId).maybeSingle();
        seller = s as import("@/types").Seller | null;
        impersonating = !!seller;
      }
    } catch {
      seller = null;
    }
  }

  if (!seller) {
    const { data: s } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
    seller = s;
  }

  if (!seller) redirect("/onboarding");

  const ordersClient = impersonating ? createSupabaseAdminClient() : supabase;

  const { count: pendingCount } = await ordersClient
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", seller.id)
    .eq("status", "pending");

  const { data: recentOrders } = await ordersClient
    .from("orders")
    .select("id,customer_name,total_amount,created_at")
    .eq("seller_id", seller.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <ShopDashboardShell
      seller={seller}
      pendingOrderCount={pendingCount ?? 0}
      recentPendingOrders={recentOrders ?? []}
      impersonating={impersonating}
    >
      {children}
    </ShopDashboardShell>
  );
}
