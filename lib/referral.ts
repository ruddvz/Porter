/** Customer mentions store referral code in message (Growth). */
export function parseReferralHint(text: string, sellerReferralCode: string | null | undefined): string | null {
  const code = sellerReferralCode?.trim().toUpperCase();
  if (!code || code.length < 2) return null;
  const re = new RegExp(`\\b${code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return re.test(text) ? code : null;
}
