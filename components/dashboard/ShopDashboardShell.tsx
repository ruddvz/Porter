"use client";

import { Sidebar, type SidebarNavItem } from "@/components/ui/Sidebar";
import TopBar, { type TopBarRecentOrder } from "@/components/dashboard/TopBar";
import InstallPrompt from "@/components/dashboard/InstallPrompt";
import PushPrompt from "@/components/dashboard/PushPrompt";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { useRealtimePendingCount } from "@/lib/hooks/useRealtimePendingCount";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Seller } from "@/types";
import { cn } from "@/lib/cn";
import {
  BarChart3,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function navActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  if (href === "/dashboard/products") {
    return pathname.startsWith("/dashboard/products") || pathname.startsWith("/dashboard/inventory");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function pageTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) return "Dashboard";
  if (pathname.startsWith("/dashboard/orders")) return "Orders";
  if (pathname.startsWith("/dashboard/conversations")) return "Conversations";
  if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
  if (pathname.startsWith("/dashboard/inventory") || pathname.startsWith("/dashboard/products")) return "Products";
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

  const pendingLive = useRealtimePendingCount(seller.id, pendingOrderCount);

  const sidebarItems: SidebarNavItem[] = useMemo(
    () => [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/products", label: "Products", icon: Package },
      {
        href: "/dashboard/orders",
        label: "Orders",
        icon: ShoppingCart,
        badge: pendingLive > 0 ? pendingLive : undefined,
      },
      { href: "/dashboard/conversations", label: "Conversations", icon: MessageCircle },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
    [pendingLive],
  );

  const bottomItems = useMemo(
    () => [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard },
      {
        href: "/dashboard/orders",
        label: "Orders",
        icon: ShoppingCart,
        badge: pendingLive > 0 ? pendingLive : undefined,
      },
      { href: "/dashboard/products", label: "Products", icon: Package },
      { href: "/dashboard/conversations", label: "Chats", icon: MessageCircle },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
    [pendingLive],
  );

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const title = pageTitle(pathname);

  return (
    <>
      <Sidebar
        brand="PORTER"
        subtitle={seller.store_name}
        userName={seller.store_name}
        items={sidebarItems}
        onLogout={logout}
        mobileOpen={mobileNav}
        onMobileOpenChange={setMobileNav}
      />
      <div className="min-h-screen lg:pl-[220px]">
        {impersonating && (
          <div className="sticky top-0 z-40 border-b border-porter-status-cancelled/40 bg-porter-status-cancelled/15 px-4 py-2 text-center text-sm font-semibold text-porter-status-cancelled">
            You are viewing as {seller.store_name}. Use Exit view in the top bar to return to admin.
          </div>
        )}
        <TopBar
          title={title}
          seller={seller}
          pendingOrderCount={pendingLive}
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
        <PWAInstallBanner />

        <nav
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-porter-bg-border bg-porter-bg-base/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
          aria-label="Primary"
        >
          <div className="mx-auto flex max-w-lg justify-around px-1 py-2">
            {bottomItems.map((item) => {
              const active = navActive(item.href, pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-12 min-w-[3.5rem] flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[10px] font-mono uppercase tracking-wide transition-colors",
                    active ? "text-[--accent]" : "text-porter-text-muted hover:text-porter-text-secondary",
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
                  <span className="max-w-[4rem] truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
