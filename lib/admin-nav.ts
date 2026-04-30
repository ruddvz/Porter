import {
  Activity,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";

export const ADMIN_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/sellers/", label: "Sellers", icon: Store },
  { href: "/admin/orders/", label: "Orders", icon: ShoppingCart },
  { href: "/admin/analytics/", label: "Analytics", icon: Activity },
  { href: "/admin/settings/", label: "Settings", icon: Settings },
];
