import type { Seller, WorkingHoursMap } from "@/types";

type WeekdayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

function parseHm(s: string): { h: number; m: number } | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null;
  return { h, m: min };
}

/** Minutes since midnight in seller tz for "now". */
export function minutesNowInTimeZone(timeZone: string): number | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return hour * 60 + minute;
  } catch {
    return null;
  }
}

function dayKeyInTimeZone(timeZone: string): WeekdayKey | null {
  try {
    const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(new Date());
    const map: Record<string, WeekdayKey> = {
      Sun: "sun",
      Mon: "mon",
      Tue: "tue",
      Wed: "wed",
      Thu: "thu",
      Fri: "fri",
      Sat: "sat",
    };
    return map[wd] ?? null;
  } catch {
    return null;
  }
}

/** Whether the shop is open now per `working_hours` (24h local times per weekday key). */
export function isSellerWithinWorkingHours(
  seller: Pick<Seller, "working_hours" | "timezone">,
): boolean {
  const tz = (seller.timezone as string | undefined)?.trim() || "Asia/Kolkata";
  const h = seller.working_hours as WorkingHoursMap | null | undefined;
  if (!h || typeof h !== "object") return true;

  const day = dayKeyInTimeZone(tz);
  if (!day) return true;
  const slot = h[day];
  if (!slot?.open || !slot?.close) return true;

  const open = parseHm(slot.open);
  const close = parseHm(slot.close);
  if (!open || !close) return true;

  const nowMin = minutesNowInTimeZone(tz);
  if (nowMin === null) return true;

  const openMin = open.h * 60 + open.m;
  const closeMin = close.h * 60 + close.m;

  if (openMin <= closeMin) {
    return nowMin >= openMin && nowMin <= closeMin;
  }
  return nowMin >= openMin || nowMin <= closeMin;
}
