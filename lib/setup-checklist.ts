import type { Product, Seller } from "@/types";

export type SetupCheckItem = {
  id: string;
  label: string;
  done: boolean;
  href?: string;
  action?: string;
};

export function buildSetupChecklist(params: {
  seller: Seller;
  productCount: number;
  orderCount: number;
  hasZones: boolean;
  whatsappConnected: boolean;
}): SetupCheckItem[] {
  const { seller, productCount, orderCount, hasZones, whatsappConnected } = params;
  const slug = seller.store_slug;

  return [
    {
      id: "profile",
      label: "Store profile completed",
      done: Boolean(seller.store_name?.trim() && seller.whatsapp_number?.trim()),
      href: "/dashboard/settings",
    },
    {
      id: "products",
      label: "Products added",
      done: productCount >= 3,
      href: "/dashboard/inventory",
    },
    {
      id: "delivery",
      label: "Pickup / delivery configured",
      done: hasZones || Boolean(seller.pickup_enabled),
      href: "/dashboard/settings",
    },
    {
      id: "website",
      label: "Website Order Online button",
      done: Boolean(slug),
      href: "/dashboard/settings",
      action: "website",
    },
    {
      id: "whatsapp",
      label: "WhatsApp ordering tested",
      done: whatsappConnected || orderCount > 0,
      href: "/dashboard/settings",
      action: "meta",
    },
    {
      id: "live",
      label: "Store live",
      done: productCount >= 1 && Boolean(slug) && seller.is_active,
      href: slug ? `/store/${slug}` : undefined,
    },
  ];
}

export function setupProgress(items: SetupCheckItem[]): number {
  if (!items.length) return 0;
  return Math.round((items.filter((i) => i.done).length / items.length) * 100);
}

export function filterLowStockProducts(products: Product[], _sellerId?: string, thresholdDefault = 5) {
  return products.filter((p) => {
    if (p.is_active === false) return false;
    const th = p.low_stock_threshold ?? thresholdDefault;
    const sq = p.stock_quantity ?? 0;
    return sq <= th;
  });
}
