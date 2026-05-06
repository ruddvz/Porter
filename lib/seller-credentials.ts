import { decryptOptional } from "@/lib/field-crypto";
import type { Seller } from "@/types";

/** Meta token for WhatsApp API — decrypts meta_access_token_enc when secret set. */
export function getMetaAccessTokenForSeller(seller: Seller): string | null {
  const secret = process.env.PORTER_CREDENTIAL_SECRET;
  if (secret && (seller as { meta_access_token_enc?: string | null }).meta_access_token_enc) {
    const d = decryptOptional((seller as { meta_access_token_enc?: string }).meta_access_token_enc, secret);
    if (d) return d;
  }
  return seller.meta_access_token ?? null;
}

export function getRazorpayKeysForSeller(seller: Seller): { keyId: string; keySecret: string } | null {
  const secret = process.env.PORTER_CREDENTIAL_SECRET;
  const idEnc = seller.razorpay_key_id_enc;
  const secEnc = seller.razorpay_key_secret_enc;
  if (secret && idEnc && secEnc) {
    const keyId = decryptOptional(idEnc, secret);
    const keySecret = decryptOptional(secEnc, secret);
    if (keyId && keySecret) return { keyId, keySecret };
  }
  if (seller.razorpay_key_id && seller.razorpay_key_secret) {
    return { keyId: seller.razorpay_key_id, keySecret: seller.razorpay_key_secret };
  }
  return null;
}

export function getUpiForSeller(seller: Seller): string | null {
  const secret = process.env.PORTER_CREDENTIAL_SECRET;
  if (secret && seller.upi_id_enc) {
    const d = decryptOptional(seller.upi_id_enc, secret);
    if (d) return d;
  }
  return seller.upi_id ?? null;
}
