import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ParsedLineItem, Product } from "@/types";
import { FUZZY_CONFIDENCE_THRESHOLD, fuzzyMatchProducts } from "@/lib/fuzzy";

/** Parses a single line / phrase into line items using fuzzy match first, Gemini when confidence is low. */
export async function parseOrderText(
  text: string,
  products: Product[]
): Promise<ParsedLineItem[]> {
  const lines = text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const items: ParsedLineItem[] = [];
  const unmatched: string[] = [];

  for (const line of lines) {
    const fuzzy = fuzzyMatchProducts(line, products);
    if (fuzzy && fuzzy.score >= FUZZY_CONFIDENCE_THRESHOLD) {
      const qtyUnit = extractQuantityAndUnit(line);
      const qty = qtyUnit.quantity;
      const unit = qtyUnit.unit || fuzzy.product.unit;
      const unitPrice = Number(fuzzy.product.price);
      items.push({
        product_id: fuzzy.product.id,
        product_name: fuzzy.product.name,
        quantity: qty,
        unit,
        unit_price: unitPrice,
        total_price: round2(qty * unitPrice),
      });
    } else {
      unmatched.push(line);
    }
  }

  if (unmatched.length === 0) return mergeDuplicateProducts(items);

  const geminiItems = await parseWithGemini(unmatched.join("\n"), products);
  return mergeDuplicateProducts([...items, ...geminiItems]);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function extractQuantityAndUnit(line: string): { quantity: number; unit: string } {
  const lower = line.toLowerCase();
  const m = lower.match(/(\d+(?:\.\d+)?)\s*(kilo|kg|kilogram|litre|liter|l|packet|pkt|piece|pc|dozen|dz)?/);
  if (!m) return { quantity: 1, unit: "" };
  const q = parseFloat(m[1]);
  let unit = m[2] || "";
  if (unit === "kilo" || unit === "kilogram") unit = "kg";
  if (unit === "liter") unit = "litre";
  if (unit === "packet") unit = "pkt";
  if (unit === "pc") unit = "piece";
  if (unit === "dz") unit = "dozen";
  return { quantity: Number.isFinite(q) && q > 0 ? q : 1, unit };
}

function mergeDuplicateProducts(items: ParsedLineItem[]): ParsedLineItem[] {
  const map = new Map<string, ParsedLineItem>();
  for (const it of items) {
    const key = `${it.product_id ?? it.product_name}|${it.unit}`;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { ...it });
    } else {
      prev.quantity += it.quantity;
      prev.total_price = round2(prev.quantity * prev.unit_price);
    }
  }
  return Array.from(map.values());
}

/** Calls Gemini Flash with trilingual instructions to map free text to catalog products. */
async function parseWithGemini(chunk: string, products: Product[]): Promise<ParsedLineItem[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("[gemini] GEMINI_API_KEY missing");
    return [];
  }
  const catalog = products
    .filter((p) => p.in_stock)
    .map(
      (p) =>
        `- id:${p.id} name:${p.name} aliases:${(p.aliases ?? []).join(",")} price:${p.price} unit:${p.unit}`
    )
    .join("\n");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an order parser for an Indian grocery shop. Input may be Gujarati, Hindi, or English.
Match each requested item to ONE product from the catalog by id. Output ONLY valid JSON array, no markdown:
[{"product_id":"uuid","product_name":"string","quantity":number,"unit":"string"}]
Use catalog unit if unsure. quantity must be positive number.

Catalog:
${catalog}

Customer text:
${chunk}`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) return [];
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit: string;
    }>;
    const out: ParsedLineItem[] = [];
    for (const row of parsed) {
      const p = products.find((x) => x.id === row.product_id);
      if (!p) continue;
      const qty = Number(row.quantity) > 0 ? Number(row.quantity) : 1;
      const unit = row.unit || p.unit;
      const unitPrice = Number(p.price);
      out.push({
        product_id: p.id,
        product_name: p.name,
        quantity: qty,
        unit,
        unit_price: unitPrice,
        total_price: round2(qty * unitPrice),
      });
    }
    return out;
  } catch (e) {
    console.error("[gemini] parse error", e);
    return [];
  }
}
