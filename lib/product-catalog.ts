import type { Product } from "@/types";

/** Products shown in the WhatsApp bot catalog (active + sellable). */
export function isProductListedForBot(p: Product): boolean {
  if (p.is_active === false) return false;
  if (p.stock_quantity != null && p.stock_quantity <= 0) return false;
  return p.in_stock;
}
