/**
 * Base path for Porter (empty for apex domain, `/repo` for GitHub Project Pages).
 * Set NEXT_PUBLIC_BASE_PATH at build time to match BASE_PATH in next.config.
 */
export function getBasePath(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return raw.replace(/\/$/, "");
}

export function withBasePath(path: string): string {
  const base = getBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
