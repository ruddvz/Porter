import type { Seller, SellerPlan } from "@/types";

export type PlanGateFeature =
  | "products"
  | "orders_monthly"
  | "analytics_history"
  | "push_notifications"
  | "nudge_cron"
  | "custom_bot_greeting"
  | "delivery_zones"
  | "csv_export";

export type PlanGateResult = { ok: true } | { ok: false; reason: string; upgradeTo?: SellerPlan };

const DEFAULTS = {
  starter: { maxProducts: 50, maxOrdersPerMonth: 200, analyticsDays: 30 },
  growth: { maxProducts: Infinity, maxOrdersPerMonth: Infinity, analyticsDays: 365 },
};

export function planLimits(plan: SellerPlan) {
  return plan === "growth" ? DEFAULTS.growth : DEFAULTS.starter;
}

export function checkGate(
  seller: Pick<Seller, "plan">,
  feature: PlanGateFeature,
  ctx?: { productCount?: number; ordersThisMonth?: number; zoneCount?: number }
): PlanGateResult {
  const p = seller.plan ?? "starter";
  const lim = planLimits(p);

  if (feature === "push_notifications" || feature === "nudge_cron") {
    if (p !== "growth") return { ok: false, reason: "Available on Growth plan.", upgradeTo: "growth" };
    return { ok: true };
  }

  if (feature === "custom_bot_greeting") {
    if (p !== "growth") return { ok: false, reason: "Custom greeting is a Growth feature.", upgradeTo: "growth" };
    return { ok: true };
  }

  if (feature === "products") {
    const n = ctx?.productCount ?? 0;
    if (p === "starter" && n >= lim.maxProducts) {
      return { ok: false, reason: `Starter plan allows up to ${lim.maxProducts} products.`, upgradeTo: "growth" };
    }
    return { ok: true };
  }

  if (feature === "orders_monthly") {
    const n = ctx?.ordersThisMonth ?? 0;
    if (p === "starter" && n >= lim.maxOrdersPerMonth) {
      return { ok: false, reason: `Starter plan allows up to ${lim.maxOrdersPerMonth} orders per month.`, upgradeTo: "growth" };
    }
    return { ok: true };
  }

  if (feature === "analytics_history") {
    return { ok: true };
  }

  if (feature === "delivery_zones") {
    const z = ctx?.zoneCount ?? 0;
    if (p === "starter" && z > 1) {
      return { ok: false, reason: "Starter allows one delivery zone. Upgrade for unlimited zones.", upgradeTo: "growth" };
    }
    return { ok: true };
  }

  if (feature === "csv_export") {
    if (p !== "growth") return { ok: false, reason: "CSV export is available on Growth plan.", upgradeTo: "growth" };
    return { ok: true };
  }

  return { ok: true };
}

export function analyticsHistoryCutoffIso(seller: Pick<Seller, "plan">): string {
  const days = planLimits(seller.plan ?? "starter").analyticsDays;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}
