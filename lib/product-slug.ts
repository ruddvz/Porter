import { slugifyStoreName } from "@/lib/store-slug";

export function slugifyProductName(name: string): string {
  return slugifyStoreName(name);
}

/** Append -2, -3, … until slug is unique for this seller. */
export function uniqueProductSlug(base: string, existing: Set<string>): string {
  let candidate = base;
  let n = 2;
  while (existing.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  existing.add(candidate);
  return candidate;
}
