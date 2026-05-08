/**
 * Post-auth redirect target from OAuth query params.
 * Allows only same-origin relative paths to prevent open redirects.
 */
export function safeAuthNextPath(raw: string | null | undefined, fallback: string): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}
