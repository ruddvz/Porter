"use client";

import { Sidebar, type SidebarNavItem } from "@/components/ui/Sidebar";
import { TopBar, type TopBarNotification } from "@/components/dashboard/TopBar";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Warehouse,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

function normalizeShopPath(pathname: string | null): string {
  if (!pathname) return "/dashboard/";
  let p = pathname;
  if (p === "/dashboard" || p === "/dashboard/") return "/dashboard/";
  if (!p.endsWith("/")) p += "/";
  return p;
}

const nav: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/dashboard/", label: "Live orders", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/dashboard/orders/", label: "Order history", icon: <ShoppingCart className="h-5 w-5" /> },
  { href: "/dashboard/inventory/", label: "Inventory", icon: <Warehouse className="h-5 w-5" /> },
  { href: "/dashboard/settings/", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

const titles: Record<string, string> = {
  "/dashboard/": "Live orders",
  "/dashboard/orders/": "Order history",
  "/dashboard/inventory/": "Inventory",
  "/dashboard/settings/": "Settings",
};

export type ShopShellProps = {
  children: ReactNode;
  storeName?: string;
  userName?: string;
  notifications?: TopBarNotification[];
};

export function ShopShell({
  children,
  storeName = "Demo Store",
  userName = "Seller",
  notifications,
}: ShopShellProps) {
  const pathname = usePathname();
  const normalized = normalizeShopPath(pathname);

  const title = titles[normalized] ?? "Dashboard";
  const [mobileNav, setMobileNav] = useState(false);

  const items: SidebarNavItem[] = useMemo(
    () =>
      nav.map((n) => ({
        ...n,
        active:
          n.href === "/dashboard/"
            ? normalized === "/dashboard/"
            : normalized === n.href || normalized.startsWith(n.href),
      })),
    [normalized]
  );

  const defaultNotifs: TopBarNotification[] = notifications ?? [
    { id: "1", customerName: "Meera Joshi", totalRupee: 330, relativeTime: "12 mins ago" },
    { id: "2", customerName: "Ravi Shah", totalRupee: 120, relativeTime: "1 hr ago" },
  ];

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-porter-bg-base">
      <Sidebar
        brand={
          <span className="font-display text-xl tracking-wide text-porter-green-500">PORTER</span>
        }
        items={items}
        userName={userName}
        onLogout={() => {}}
        mobileOpen={mobileNav}
        onMobileOpenChange={setMobileNav}
        hideMobileMenuButton
      />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <TopBar
          title={title}
          storeName={storeName}
          onMenuOpen={() => setMobileNav(true)}
          notifications={defaultNotifs}
          userName={userName}
          onLogout={() => {}}
        />
        <main className="flex-1 overflow-auto p-space-4 pb-space-10 sm:p-space-6">{children}</main>
      </div>
    </div>
  );
}
