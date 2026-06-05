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
        brand="Porter"
        subtitle={seller.store_name}
        userName={seller.store_name}
        items={items}
        onLogout={logout}
        mobileOpen={mobileNav}
        onMobileOpenChange={setMobileNav}
      />
      <div className="min-h-screen scroll-pb-app lg:pl-60">
        {impersonating && (
          <div className="safe-top sticky top-0 z-40 border-b border-porter-orange-500/30 bg-[var(--po-warning-soft)] px-4 py-2.5 text-center text-sm font-semibold text-porter-orange-600">
            Admin view: {seller.store_name}. You are viewing this seller workspace. Actions may affect live data.
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
          className="pointer-events-none fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+10px)] z-30 lg:hidden"
          aria-label="Primary"
        >
          <div className="pointer-events-auto mx-auto flex h-[66px] max-w-lg items-center justify-around rounded-[var(--po-radius-pill)] border border-[rgba(234,223,206,0.82)] bg-white/86 px-1 shadow-[0_16px_40px_rgba(17,24,39,0.14)] backdrop-blur-[18px]">
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
                    "flex min-h-11 min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-[var(--po-radius-md)] px-2 text-[11px] font-bold transition-colors",
                    active
                      ? "bg-[var(--po-primary-soft)] text-porter-green-600"
                      : "text-porter-text-muted hover:text-porter-text-secondary",
                  )}
                >
                  <span className="relative inline-flex">
                    <Icon className="h-5 w-5" aria-hidden />
                    {item.badge != null && item.badge !== 0 && (
                      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-porter-orange-500 px-1 text-[10px] font-bold text-white">
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
                "flex min-h-11 min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-[var(--po-radius-md)] px-2 text-[11px] font-bold transition-colors",
                moreActive || moreOpen
                  ? "bg-[var(--po-primary-soft)] text-porter-green-600"
                  : "text-porter-text-muted hover:text-porter-text-secondary",
              )}
              aria-label="More navigation"
              aria-expanded={moreOpen}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
              <span>More</span>
            </button>
          </div>
        </nav>

        <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} items={mobileMore} pathname={pathname} onLogout={() => void logout()} />
      </div>
    </>
  );
}
