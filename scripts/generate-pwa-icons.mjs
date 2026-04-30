/**
 * Generates PWA icons into public/ (solid Porter-branded tiles).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0A0F0D"/>
  <rect x="${Math.round(size * 0.08)}" y="${Math.round(size * 0.08)}" width="${Math.round(size * 0.84)}" height="${Math.round(size * 0.84)}" rx="${Math.round(size * 0.12)}" fill="#111A14" stroke="#25D366" stroke-width="${Math.max(2, Math.round(size * 0.02))}"/>
  <text x="50%" y="54%" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="700" font-size="${Math.round(size * 0.32)}" fill="#25D366">P</text>
</svg>`;

async function writePng(size, name) {
  const buf = await sharp(Buffer.from(svg(size))).png().toBuffer();
  await writeFile(join(publicDir, name), buf);
  console.log("wrote", name);
}

await writePng(512, "icon-512.png");
await writePng(192, "icon-192.png");
await writePng(180, "apple-touch-icon.png");
console.log("PWA icons ready in public/");
