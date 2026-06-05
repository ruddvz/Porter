/**
 * Generates placeholder PWA QA screenshots for docs/screenshots/pwa/
 * Run: npm run build && node scripts/capture-pwa-screenshots.mjs
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.join(process.cwd(), "docs/screenshots/pwa");

const shots = [
  { name: "home-chromium-1280.png", path: "/", viewport: { width: 1280, height: 720 } },
  { name: "login-iphone-se-375.png", path: "/auth/login", viewport: { width: 375, height: 667 } },
  { name: "offline-iphone-se-375.png", path: "/offline", viewport: { width: 375, height: 667 } },
];

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: s.viewport });
  await page.goto(`${base}${s.path}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, s.name), fullPage: true });
  await page.close();
  console.log("wrote", s.name);
}
await browser.close();
