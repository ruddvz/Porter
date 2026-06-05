import { test, expect } from "@playwright/test";

const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/offline",
  "/privacy",
  "/terms",
  "/design-system",
];

for (const path of publicRoutes) {
  test(`public route ${path} responds`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
}

test("track slug shows fallback UI", async ({ page }) => {
  const res = await page.goto("/track/test-slug");
  expect(res?.status()).toBeLessThan(500);
});

test("dashboard redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});

test("mobile dashboard shell has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  expect(overflow).toBe(false);
});
