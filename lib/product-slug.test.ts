import { describe, expect, it } from "vitest";
import { slugifyProductName, uniqueProductSlug } from "./product-slug";

describe("product slug", () => {
  it("slugifies names", () => {
    expect(slugifyProductName("Amul Butter 500g")).toBe("amul-butter-500g");
  });

  it("dedupes collisions", () => {
    const set = new Set(["milk"]);
    expect(uniqueProductSlug("milk", set)).toBe("milk-2");
  });
});
