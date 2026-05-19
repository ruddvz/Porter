import crypto from "crypto";

const DEFAULT_BASE = "http://localhost:2785";

function baseUrl(): string {
  return (process.env.OPENWA_API_URL ?? DEFAULT_BASE).replace(/\/$/, "");
}

function apiKey(): string | null {
  return process.env.OPENWA_API_KEY?.trim() || null;
}

export function isOpenWAConfigured(): boolean {
  return Boolean(apiKey());
}

type OpenWAResponse<T> = { success: boolean; data?: T; error?: { message?: string } };

async function openwaFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const key = apiKey();
  if (!key) return { ok: false, status: 503, message: "OPENWA_API_KEY is not configured" };
  const url = `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", "X-API-Key": key, ...(init?.headers ?? {}) },
    });
    const json = (await res.json().catch(() => ({}))) as OpenWAResponse<T>;
    if (!res.ok || json.success === false) {
      return { ok: false, status: res.status, message: String(json.error?.message ?? res.statusText) };
    }
    return { ok: true, data: json.data as T };
  } catch (e) {
    return { ok: false, status: 502, message: e instanceof Error ? e.message : String(e) };
  }
}

export type OpenWASession = { id: string; name: string; status: string; phone?: string | null };

export async function createOpenWASession(name: string) {
  const res = await openwaFetch<OpenWASession>("/api/sessions", { method: "POST", body: JSON.stringify({ name }) });
  return res.ok ? { ok: true as const, session: res.data } : { ok: false as const, message: res.message };
}

export async function startOpenWASession(sessionId: string) {
  const res = await openwaFetch<unknown>(`/api/sessions/${encodeURIComponent(sessionId)}/start`, { method: "POST" });
  return res.ok ? { ok: true as const } : { ok: false as const, message: res.message };
}

export type OpenWAQr = { qr?: string; status?: string };

export async function getOpenWAQr(sessionId: string) {
  const res = await openwaFetch<OpenWAQr>(`/api/sessions/${encodeURIComponent(sessionId)}/qr`);
  return res.ok ? { ok: true as const, qr: res.data } : { ok: false as const, message: res.message };
}

export async function getOpenWASession(sessionId: string) {
  const res = await openwaFetch<OpenWASession>(`/api/sessions/${encodeURIComponent(sessionId)}`);
  return res.ok ? { ok: true as const, session: res.data } : { ok: false as const, message: res.message };
}

export async function registerOpenWAWebhook(sessionId: string, webhookUrl: string, secret: string) {
  const res = await openwaFetch<unknown>(`/api/sessions/${encodeURIComponent(sessionId)}/webhooks`, {
    method: "POST",
    body: JSON.stringify({ url: webhookUrl, secret, events: ["message.received"] }),
  });
  return res.ok ? { ok: true as const } : { ok: false as const, message: res.message };
}

export function phoneToOpenWAChatId(phone: string): string {
  return `${phone.replace(/\D/g, "")}@c.us`;
}

export async function sendOpenWAText(sessionId: string, phone: string, text: string): Promise<boolean> {
  const res = await openwaFetch<{ messageId?: string }>(
    `/api/sessions/${encodeURIComponent(sessionId)}/messages/send-text`,
    { method: "POST", body: JSON.stringify({ chatId: phoneToOpenWAChatId(phone), text }) }
  );
  if (!res.ok) console.error("[openwa] send failed", res.message);
  return res.ok;
}

export function openWAChatIdToPhone(chatId: string): string {
  const digits = chatId.split("@")[0]?.replace(/\D/g, "") ?? "";
  if (!digits) return "";
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

export function verifyOpenWAWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(signatureHeader);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
