import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyRazorpayWebhookSignature } from "./razorpay-webhook-signature";

const secret = "razorpay-webhook-secret";
const body = '{"event":"payment.captured"}';

function sign(bodyText: string, webhookSecret: string): string {
  return createHmac("sha256", webhookSecret).update(bodyText).digest("hex");
}

describe("verifyRazorpayWebhookSignature", () => {
  it("accepts valid signature", () => {
    expect(verifyRazorpayWebhookSignature(body, sign(body, secret), secret)).toBe(true);
  });

  it("rejects invalid signature", () => {
    expect(verifyRazorpayWebhookSignature(body, "bad", secret)).toBe(false);
  });

  it("rejects missing signature", () => {
    expect(verifyRazorpayWebhookSignature(body, null, secret)).toBe(false);
  });
});
