/**
 * Capture UI redesign reference screenshots at mobile + desktop widths.
 * Run: npm run build && npm run start & PLAYWRIGHT_SKIP_WEBSERVER=1 node scripts/capture-ui-redesign-screenshots.mjs
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.join(process.cwd(), "docs/screenshots/ui-redesign/after");

const routes = [
  { name: "home-390", path: "/", viewport: { width: 390, height: 844 } },
  { name: "home-768", path: "/", viewport: { width: 768, height: 1024 } },
  { name: "login-390", path: "/auth/login", viewport: { width: 390, height: 844 } },
  { name: "signup-390", path: "/auth/signup", viewport: { width: 390, height: 844 } },
  { name: "offline-390", path: "/offline", viewport: { width: 390, height: 844 } },
  { name: "privacy-390", path: "/privacy", viewport: { width: 390, height: 844 } },
  { name: "terms-390", path: "/terms", viewport: { width: 390, height: 844 } },
  { name: "not-found-390", path: "/this-page-does-not-exist-porter", viewport: { width: 390, height: 844 } },
  { name: "design-system-1280", path: "/design-system", viewport: { width: 1280, height: 800 } },
  { name: "track-390", path: "/track/test-slug-not-found", viewport: { width: 390, height: 844 } },
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const s of routes) {
  const page = await browser.newPage({ viewport: s.viewport });
  const res = await page.goto(`${base}${s.path}`, { waitUntil: "networkidle" });
  if (res && res.status() >= 500) {
    console.warn("skip", s.name, "status", res.status());
    await page.close();
    continue;
  }
  await page.screenshot({ path: path.join(outDir, `${s.name}.png`), fullPage: true });
  await page.close();
  console.log("wrote", s.name);
}
await browser.close();
