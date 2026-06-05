import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const a11yRoutes = ["/", "/auth/login", "/offline", "/terms"];

for (const path of a11yRoutes) {
  test(`no serious/critical a11y violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .disableRules(["color-contrast"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
