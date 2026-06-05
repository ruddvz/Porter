import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyMetaWebhookSignature } from "./meta-webhook-signature";

const secret = "test-meta-app-secret";
const body = '{"object":"whatsapp_business_account"}';

function sign(bodyText: string, appSecret: string): string {
  const hex = createHmac("sha256", appSecret).update(bodyText, "utf8").digest("hex");
  return `sha256=${hex}`;
}

describe("verifyMetaWebhookSignature", () => {
  it("accepts valid signature", () => {
    const sig = sign(body, secret);
    expect(verifyMetaWebhookSignature(body, sig, secret)).toBe(true);
  });

  it("rejects invalid signature", () => {
    expect(verifyMetaWebhookSignature(body, "sha256=deadbeef", secret)).toBe(false);
  });

  it("rejects missing signature", () => {
    expect(verifyMetaWebhookSignature(body, null, secret)).toBe(false);
  });

  it("rejects missing secret", () => {
    expect(verifyMetaWebhookSignature(body, sign(body, secret), "")).toBe(false);
  });
});
