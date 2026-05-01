import type { Product } from "@/types";

/** Products eligible for the WhatsApp bot catalog. */
export function isProductListedForBot(p: Product): boolean {
  if (p.is_active === false) return false;
  if (p.stock_quantity != null && p.stock_quantity <= 0) return false;
  return p.in_stock;
}
