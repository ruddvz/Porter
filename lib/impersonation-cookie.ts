import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "porter_admin_impersonate";

function secret(): string {
  const s = process.env.PORTER_IMPERSONATION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("Missing PORTER_IMPERSONATION_SECRET or SUPABASE_SERVICE_ROLE_KEY");
  return s;
}

/** Signed payload: sellerId.expiryUnix.adminUserId */
export function signImpersonationCookie(sellerId: string, adminUserId: string, maxAgeSeconds = 60 * 60 * 4): string {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${sellerId}.${exp}.${adminUserId}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyImpersonationCookie(
  value: string | undefined | null,
  adminUserId: string,
): { sellerId: string } | null {
  if (!value?.includes(".")) return null;
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  const [sellerId, expStr, cookieAdminId, sig] = parts;
  if (!sellerId || cookieAdminId !== adminUserId) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  const payload = `${sellerId}.${expStr}.${cookieAdminId}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { sellerId };
}

export { COOKIE_NAME as IMPERSONATION_COOKIE_NAME };
