import type { Product } from "@/types";

/** Products eligible for the WhatsApp bot catalog (active + sellable). */
export function isProductListedForBot(p: Product): boolean {
  if (p.is_active === false) return false;
  if (p.stock_quantity != null && p.stock_quantity <= 0) return false;
  return p.in_stock;
}

/** Explains why a product is hidden from the bot (empty when listed). */
export function productListingHint(p: Product): string {
  if (p.is_active === false) return "Listing is off — enable “Listed in bot” to show this product.";
  if (p.stock_quantity != null && p.stock_quantity <= 0) return "Stock is zero — increase quantity to list.";
  if (!p.in_stock) return "Marked out of stock — restock to list.";
  return "";
}
