import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { signImpersonationCookie, verifyImpersonationCookie } from "./impersonation-cookie";

describe("impersonation cookie", () => {
  const prev = process.env.PORTER_IMPERSONATION_SECRET;

  beforeEach(() => {
    process.env.PORTER_IMPERSONATION_SECRET = "test-impersonation-secret-at-least-32-chars";
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.PORTER_IMPERSONATION_SECRET;
    else process.env.PORTER_IMPERSONATION_SECRET = prev;
  });

  it("round-trips a valid signed cookie", () => {
    const signed = signImpersonationCookie("seller-1", "admin-1", 3600);
    expect(verifyImpersonationCookie(signed, "admin-1")).toEqual({ sellerId: "seller-1" });
  });

  it("rejects tampered signature", () => {
    const signed = signImpersonationCookie("seller-1", "admin-1", 3600);
    const tampered = signed.slice(0, -4) + "xxxx";
    expect(verifyImpersonationCookie(tampered, "admin-1")).toBeNull();
  });

  it("rejects wrong admin user", () => {
    const signed = signImpersonationCookie("seller-1", "admin-1", 3600);
    expect(verifyImpersonationCookie(signed, "admin-2")).toBeNull();
  });

  it("rejects expired cookie", () => {
    const signed = signImpersonationCookie("seller-1", "admin-1", -10);
    expect(verifyImpersonationCookie(signed, "admin-1")).toBeNull();
  });
});
