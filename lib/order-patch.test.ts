import { describe, expect, it } from "vitest";
import { validateOrderPatch } from "./order-patch";

describe("validateOrderPatch", () => {
  it("allows valid status transition", () => {
    expect(validateOrderPatch({ status: "pending" }, { status: "confirmed" })).toEqual({ ok: true });
  });

  it("blocks invalid transition", () => {
    const r = validateOrderPatch({ status: "delivered" }, { status: "pending" });
    expect(r.ok).toBe(false);
  });
});
