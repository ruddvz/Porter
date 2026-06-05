import { describe, expect, it } from "vitest";
import { mergeCartLine, reconcileCartWithCatalog } from "./storefront-cart";

describe("storefront cart", () => {
  it("merges duplicate product lines", () => {
    const lines = mergeCartLine(
      [],
      {
        productId: "p1",
        name: "Aloo",
        price: 10,
        unit: "kg",
        stock_quantity: 5,
        in_stock: true,
      },
      2,
    );
    const again = mergeCartLine(lines, {
      productId: "p1",
      name: "Aloo",
      price: 10,
      unit: "kg",
      stock_quantity: 5,
      in_stock: true,
    });
    expect(again[0].qty).toBe(3);
  });

  it("drops unavailable products on reconcile", () => {
    const { cart, removed } = reconcileCartWithCatalog(
      [
        {
          productId: "gone",
          name: "Gone",
          price: 1,
          unit: "kg",
          stock_quantity: 0,
          in_stock: false,
          qty: 1,
        },
      ],
      [],
    );
    expect(cart).toHaveLength(0);
    expect(removed).toContain("Gone");
  });
});
