/**
 * Generates Porter PWA icons (dark canvas + WhatsApp green accent "P").
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public", "icons");
const screenshotsDir = join(root, "public", "screenshots");

const BG = "#0a0a0a";
const ACCENT = "#25d366";

function iconSvg(size) {
  const r = Math.round(size * 0.18);
  const fs = Math.round(size * 0.42);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect x="${size * 0.12}" y="${size * 0.12}" width="${size * 0.76}" height="${size * 0.76}" rx="${r}" fill="${ACCENT}"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
    font-family="ui-monospace, monospace" font-weight="700" font-size="${fs}" fill="${BG}">P</text>
</svg>`;
}

function badgeSvg(size) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${ACCENT}"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="ui-monospace, monospace" font-weight="700" font-size="${size * 0.45}" fill="${BG}">P</text>
</svg>`;
}

function shortcutSvg(label, size) {
  const fs = Math.round(size * 0.14);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.12}" fill="${BG}"/>
  <rect x="${size * 0.08}" y="${size * 0.08}" width="${size * 0.84}" height="${size * 0.56}" rx="${size * 0.06}" fill="${ACCENT}" opacity="0.25"/>
  <text x="50%" y="${size * 0.38}" dominant-baseline="middle" text-anchor="middle"
    font-family="ui-monospace, monospace" font-weight="600" font-size="${fs}" fill="${ACCENT}">${label}</text>
</svg>`;
}

async function pngFromSvg(svg, outPath, width, height = width) {
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(outPath);
}

async function main() {
  await mkdir(iconsDir, { recursive: true });
  await mkdir(screenshotsDir, { recursive: true });

  const sizes = [72, 96, 128, 144, 192, 512];
  for (const s of sizes) {
    await pngFromSvg(iconSvg(s), join(iconsDir, `icon-${s}.png`), s);
  }
  await pngFromSvg(badgeSvg(72), join(iconsDir, "badge-72.png"), 72);

  await pngFromSvg(shortcutSvg("Orders", 96), join(iconsDir, "shortcut-orders.png"), 96);
  await pngFromSvg(shortcutSvg("Products", 96), join(iconsDir, "shortcut-products.png"), 96);
  await pngFromSvg(shortcutSvg("Analytics", 96), join(iconsDir, "shortcut-analytics.png"), 96);

  // Minimal screenshot placeholders (solid + label) for manifest validity
  await pngFromSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
      <rect width="1280" height="800" fill="${BG}"/>
      <text x="50%" y="48%" text-anchor="middle" fill="${ACCENT}" font-family="monospace" font-size="36">Porter · Desktop</text>
    </svg>`,
    join(screenshotsDir, "desktop.png"),
    1280,
    800,
  );
  await pngFromSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect width="390" height="844" fill="${BG}"/>
      <text x="50%" y="48%" text-anchor="middle" fill="${ACCENT}" font-family="monospace" font-size="22">Porter · Mobile</text>
    </svg>`,
    join(screenshotsDir, "mobile.png"),
    390,
    844,
  );

  console.log("Wrote icons and screenshots to public/icons and public/screenshots");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
