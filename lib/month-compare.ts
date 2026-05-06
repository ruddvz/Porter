/** Same calendar date/time in the previous month (day clamped when the previous month is shorter). */
export function sameMomentPreviousMonth(now: Date): Date {
  const y = now.getFullYear();
  const m = now.getMonth();
  const targetDay = now.getDate();
  const daysInPrevMonth = new Date(y, m, 0).getDate();
  const day = Math.min(targetDay, daysInPrevMonth);
  return new Date(y, m - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
}

export type OrderCompareRow = {
  created_at: string;
  total_amount?: number | string | null;
  payment_status?: string | null;
};

export function isPaidOrderStatus(payment_status?: string | null): boolean {
  return payment_status === "paid" || payment_status === "cod_collected";
}

export function accumulateMtdVersusPriorMonth(
  rows: OrderCompareRow[],
  now: Date = new Date(),
): {
  mtdOrderCount: number;
  mtdRevenue: number;
  prevPeriodOrderCount: number;
  prevPeriodRevenue: number;
} {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevPeriodEnd = sameMomentPreviousMonth(now);

  let mtdOrderCount = 0;
  let mtdRevenue = 0;
  let prevPeriodOrderCount = 0;
  let prevPeriodRevenue = 0;

  for (const o of rows) {
    const t = new Date(o.created_at).getTime();
    if (t >= monthStart.getTime() && t <= now.getTime()) {
      mtdOrderCount += 1;
      if (isPaidOrderStatus(o.payment_status)) mtdRevenue += Number(o.total_amount ?? 0);
    }
    if (t >= prevMonthStart.getTime() && t <= prevPeriodEnd.getTime()) {
      prevPeriodOrderCount += 1;
      if (isPaidOrderStatus(o.payment_status)) prevPeriodRevenue += Number(o.total_amount ?? 0);
    }
  }

  return { mtdOrderCount, mtdRevenue, prevPeriodOrderCount, prevPeriodRevenue };
}

export function pctDelta(cur: number, prev: number): string {
  if (prev === 0) return cur === 0 ? "flat" : "new";
  const d = ((cur - prev) / prev) * 100;
  const sign = d >= 0 ? "+" : "";
  return `${sign}${d.toFixed(1)}%`;
}
