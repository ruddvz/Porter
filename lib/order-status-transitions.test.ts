import { describe, expect, it } from "vitest";
import { canTransitionOrderStatus } from "./order-status-transitions";

describe("canTransitionOrderStatus", () => {
  it("allows pending to confirmed", () => {
    expect(canTransitionOrderStatus("pending", "confirmed")).toBe(true);
  });

  it("blocks delivered to pending", () => {
    expect(canTransitionOrderStatus("delivered", "pending")).toBe(false);
  });

  it("allows out_for_delivery to delivered", () => {
    expect(canTransitionOrderStatus("out_for_delivery", "delivered")).toBe(true);
  });
});
