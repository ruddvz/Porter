"use client";

import { Sidebar, type SidebarNavItem } from "@/components/ui/Sidebar";
import { Badge } from "@/components/ui/Badge";
import { BarChart3, LayoutDashboard, Settings, ShoppingBag, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSidebar() {
  const router = useRouter();
  const items: SidebarNavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/sellers", label: "Sellers", icon: Users },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <Sidebar
      brand="PORTER"
      subtitle={
        <span className="flex items-center gap-2">
          <span>Admin</span>
          <Badge kind="status" variant="cancelled" label="ADMIN" size="sm" className="!py-0 !text-[9px]" />
        </span>
      }
      userName="Admin"
      items={items}
      onLogout={async () => {
        const { createSupabaseBrowserClient } = await import("@/lib/supabase");
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    />
  );
}
