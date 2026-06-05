import { createHmac, timingSafeEqual } from "crypto";

/** Meta WhatsApp Cloud API: X-Hub-Signature-256 = sha256=<hex> over raw POST body. */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!signatureHeader?.startsWith("sha256=") || !appSecret) return false;
  const expected =
    "sha256=" + createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  try {
    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function requireMetaWebhookSignatureInProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
