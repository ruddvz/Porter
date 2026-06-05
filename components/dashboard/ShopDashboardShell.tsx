"use client";

import MobileMoreSheet from "@/components/dashboard/MobileMoreSheet";
import PWAUpdateBanner from "@/components/dashboard/PWAUpdateBanner";
import TopBar, { type TopBarRecentOrder } from "@/components/dashboard/TopBar";
import PWAInstallBanner from "@/components/dashboard/PWAInstallBanner";
import PushPrompt from "@/components/dashboard/PushPrompt";
import { Sidebar, type SidebarNavItem } from "@/components/ui/Sidebar";
import { registerSellerServiceWorker } from "@/lib/registerServiceWorker";
import { useSellerPendingOrdersRealtime } from "@/lib/hooks/useSellerPendingOrdersRealtime";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Seller } from "@/types";
import { cn } from "@/lib/cn";
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  MessageCircle,
  MoreHorizontal,
  Package,
  ScrollText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function pageTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) return "Live Orders";
  if (pathname.startsWith("/dashboard/orders")) return "Order History";
  if (pathname.startsWith("/dashboard/conversations")) return "Chats";
  if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
  if (pathname.startsWith("/dashboard/inventory")) return "Inventory";
  if (pathname.startsWith("/dashboard/categories")) return "Categories";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  return "Dashboard";
}

const PRIMARY_MOBILE_HREFS = new Set([
  "/dashboard",
  "/dashboard/conversations",
  "/dashboard/inventory",
  "/dashboard/analytics",
]);

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
  const [moreOpen, setMoreOpen] = useState(false);
  const liveOrders = useSellerPendingOrdersRealtime(seller.id, pendingOrderCount, recentPendingOrders);
  const badgeCount = liveOrders.pendingOrderCount;
  const bellRecent = liveOrders.recentPendingOrders;

  const items: SidebarNavItem[] = useMemo(
    () => [
      { href: "/dashboard", label: "Orders", icon: LayoutDashboard, badge: badgeCount > 0 ? badgeCount : undefined },
      { href: "/dashboard/conversations", label: "Chats", icon: MessageCircle },
      { href: "/dashboard/inventory", label: "Inventory", icon: Package },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/orders", label: "History", icon: ScrollText },
      { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
    [badgeCount],
  );

  const mobilePrimary = items.filter((i) => PRIMARY_MOBILE_HREFS.has(i.href));
  const mobileMore = items.filter((i) => !PRIMARY_MOBILE_HREFS.has(i.href));
  const moreActive = mobileMore.some((i) =>
    i.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(i.href),
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
      <div className="min-h-screen scroll-pb-app lg:pl-60">
        {impersonating && (
          <div className="safe-top sticky top-0 z-40 border-b border-porter-status-cancelled/40 bg-porter-status-cancelled/15 px-4 py-2 text-center text-sm font-semibold text-porter-status-cancelled">
            Admin view: {seller.store_name}. Use Exit view in the top bar to return.
          </div>
        )}
        <TopBar
          title={title}
          seller={seller}
          pendingOrderCount={badgeCount}
          recentPendingOrders={bellRecent}
          onOpenNav={() => setMobileNav(true)}
          impersonating={impersonating}
        />
        <main id="main-content" className="min-h-[calc(100dvh-3.5rem)] space-y-4 app-bottom-spacer">
          <div className="px-3 pt-3 md:px-6 md:pt-4">
            <PushPrompt seller={seller} />
          </div>
          {children}
        </main>
        <PWAInstallBanner />
        <PWAUpdateBanner />

        <nav
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-porter-bg-border bg-porter-bg-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
          aria-label="Primary"
        >
          <div className="mx-auto flex max-w-lg justify-around px-1 py-2">
            {mobilePrimary.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/dashboard/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-12 min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[10px] font-semibold transition-colors",
                    active ? "text-porter-green-400" : "text-porter-text-muted hover:text-porter-text-secondary",
                  )}
                >
                  <span className="relative inline-flex">
                    <Icon className="h-5 w-5" aria-hidden />
                    {item.badge != null && item.badge !== 0 && (
                      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-porter-orange-500 px-1 text-[10px] font-bold text-black">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="max-w-[4.25rem] truncate">{item.label}</span>
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className={cn(
                "flex min-h-12 min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[10px] font-semibold transition-colors",
                moreActive || moreOpen ? "text-porter-green-400" : "text-porter-text-muted hover:text-porter-text-secondary",
              )}
              aria-label="More navigation"
              aria-expanded={moreOpen}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
              <span>More</span>
            </button>
          </div>
        </nav>

        <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} items={mobileMore} pathname={pathname} />
      </div>
    </>
  );
}
