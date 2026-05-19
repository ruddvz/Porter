export function slugifyStoreName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "store";
}

export function publicStoreUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/store/${slug}`;
}
