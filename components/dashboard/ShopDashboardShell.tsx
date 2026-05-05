"use client";

import { Sidebar, type SidebarNavItem } from "@/components/ui/Sidebar";
import TopBar, { type TopBarRecentOrder } from "@/components/dashboard/TopBar";
import InstallPrompt from "@/components/dashboard/InstallPrompt";
import PushPrompt from "@/components/dashboard/PushPrompt";
import { registerSellerServiceWorker } from "@/lib/registerServiceWorker";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Seller } from "@/types";
import { LayoutDashboard, Package, ScrollText, Settings, BarChart3 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function pageTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) return "Live Orders";
  if (pathname.startsWith("/dashboard/orders")) return "Order History";
  if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
  if (pathname.startsWith("/dashboard/inventory")) return "Inventory";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Dashboard";
}

export default function ShopDashboardShell({
  seller,
  pendingOrderCount,
  recentPendingOrders,
  impersonating,
  children,
}: {
  seller: Seller;
  pendingOrderCount: number;
  recentPendingOrders: TopBarRecentOrder[];
  impersonating?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNav, setMobileNav] = useState(false);

  const items: SidebarNavItem[] = useMemo(
    () => [
      { href: "/dashboard", label: "Live Orders", icon: LayoutDashboard, badge: pendingOrderCount > 0 ? pendingOrderCount : undefined },
      { href: "/dashboard/orders", label: "History", icon: ScrollText },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/inventory", label: "Inventory", icon: Package },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
    [pendingOrderCount],
  );

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const title = pageTitle(pathname);

  useEffect(() => {
    registerSellerServiceWorker();
  }, []);

  return (
    <>
      <Sidebar
        brand="PORTER"
        subtitle={seller.store_name}
        userName={seller.store_name}
        items={items}
        onLogout={logout}
        mobileOpen={mobileNav}
        onMobileOpenChange={setMobileNav}
      />
      <div className="min-h-screen lg:pl-60">
        {impersonating && (
          <div className="sticky top-0 z-40 border-b border-porter-status-cancelled/40 bg-porter-status-cancelled/15 px-4 py-2 text-center text-sm font-semibold text-porter-status-cancelled">
            You are viewing as {seller.store_name}. Use Exit view in the top bar to return to admin.
          </div>
        )}
        <TopBar
          title={title}
          seller={seller}
          pendingOrderCount={pendingOrderCount}
          recentPendingOrders={recentPendingOrders}
          onOpenNav={() => setMobileNav(true)}
          impersonating={impersonating}
        />
        <main className="min-h-[calc(100vh-3.5rem)] space-y-4 pb-24">
          <div className="px-3 pt-3 md:px-6 md:pt-4">
            <PushPrompt seller={seller} />
          </div>
          {children}
        </main>
        <InstallPrompt />
      </div>
    </>
  );
}
