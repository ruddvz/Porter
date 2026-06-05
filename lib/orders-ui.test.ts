import { describe, expect, it } from "vitest";
import { formatCurrencyInr, paymentBadge } from "./orders-ui";
import type { Order } from "@/types";

describe("formatCurrencyInr", () => {
  it("formats whole rupees", () => {
    expect(formatCurrencyInr(1200)).toBe("₹1,200");
  });
});

describe("paymentBadge", () => {
  it("labels COD pending", () => {
    const order = {
      payment_method: "cod",
      payment_status: "cod_pending",
    } as Order;
    expect(paymentBadge(order).label).toBe("COD pending");
  });
});
