export type StorefrontCartLine = {
  productId: string;
  name: string;
  price: number;
  unit: string;
  stock_quantity: number;
  in_stock: boolean;
  qty: number;
};

function cartKey(storeSlug: string): string {
  return `porter-cart:${storeSlug}`;
}

export function loadStorefrontCart(storeSlug: string): StorefrontCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(cartKey(storeSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StorefrontCartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStorefrontCart(storeSlug: string, lines: StorefrontCartLine[]): void {
  if (typeof window === "undefined") return;
  try {
    if (lines.length === 0) localStorage.removeItem(cartKey(storeSlug));
    else localStorage.setItem(cartKey(storeSlug), JSON.stringify(lines));
  } catch {
    /* quota / private mode */
  }
}

export function mergeCartLine(lines: StorefrontCartLine[], line: Omit<StorefrontCartLine, "qty">, qty = 1): StorefrontCartLine[] {
  const idx = lines.findIndex((l) => l.productId === line.productId);
  if (idx >= 0) {
    const next = [...lines];
    next[idx] = { ...next[idx], ...line, qty: next[idx].qty + qty };
    return next;
  }
  return [...lines, { ...line, qty }];
}

export function reconcileCartWithCatalog(
  lines: StorefrontCartLine[],
  catalog: { id: string; name: string; price: number; unit: string; stock_quantity: number; in_stock: boolean }[],
): { cart: StorefrontCartLine[]; removed: string[]; priceChanged: string[] } {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const removed: string[] = [];
  const priceChanged: string[] = [];
  const cart: StorefrontCartLine[] = [];
  for (const line of lines) {
    const p = byId.get(line.productId);
    if (!p || !p.in_stock) {
      removed.push(line.name);
      continue;
    }
    if (Number(p.price) !== Number(line.price)) priceChanged.push(p.name);
    cart.push({
      productId: p.id,
      name: p.name,
      price: Number(p.price),
      unit: p.unit,
      stock_quantity: p.stock_quantity,
      in_stock: p.in_stock,
      qty: line.qty,
    });
  }
  return { cart, removed, priceChanged };
}
