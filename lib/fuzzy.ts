import Fuse from "fuse.js";
import type { Product } from "@/types";

export interface FuzzyMatchResult {
  product: Product;
  score: number;
}

const THRESHOLD = 0.6;

/** Returns best Fuse match score (0–1, higher is better) for text against product names + aliases. */
export function fuzzyMatchProducts(text: string, products: Product[]): FuzzyMatchResult | null {
  const sorted = [...products].sort((a, b) => a.id.localeCompare(b.id));
  const flat: { product: Product; needle: string }[] = [];
  for (const p of sorted) {
    flat.push({ product: p, needle: p.name });
    for (const a of p.aliases ?? []) {
      if (a) flat.push({ product: p, needle: a });
    }
  }
  const fuse = new Fuse(flat, {
    keys: ["needle"],
    includeScore: true,
    threshold: 0.45,
    ignoreLocation: true,
  });
  const results = fuse.search(text.trim());
  const top = results[0];
  if (!top || top.score == null) return null;
  const confidence = 1 - top.score;
  if (confidence < THRESHOLD) return null;
  return { product: top.item.product, score: confidence };
}

export { THRESHOLD as FUZZY_CONFIDENCE_THRESHOLD };
