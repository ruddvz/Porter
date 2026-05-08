# Plan 0 — Implementation status (living)

**Companion:** [docs/Plan0.md](Plan0.md) (full spec). **Manual-only follow-ups:** [docs/Plan0-manual-tasks.md](Plan0-manual-tasks.md).

**“Pixel perfect” reality:** Plan0 is a long product brief (auth split layout, every chart RPC, full icon ladder, WCAG audit, Lighthouse 90+, etc.). This repo covers **the same capabilities** for most seller flows, but **not every literal CSS value, asset size, and QA line item** from Plan0 is cloned 1:1. Treat Plan0 as the **north star**; this matrix as **what shipped**.

---

## Legend

| Tag | Meaning |
|-----|---------|
| **Done** | Matches Plan0 intent closely enough for production |
| **Partial** | Exists but differs from Plan0 (different tokens, UX, or scope) |
| **Gap** | Not implemented or stub only |

---

## §0–1 · Design direction, globals, PWA shell

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Industrial dark + `#25D366` accent | **Partial** | Porter `porter-*` Tailwind remains canonical; **`globals.css` adds Plan0 semantic aliases** (`--bg-base`, `--accent`, …) mapped to `--plan0-*` |
| Geist + DM Mono (India / Latin) | **Partial** | Root/dashboard font setup unchanged |
| CSS variables `--bg-base`, `--accent`, … | **Partial → stronger** | Porter tokens + **`--plan0-*` bridge + `--bg-base` / `--accent` aliases** |
| `manifest.json` | **Partial** | Icons/shortcuts; **screenshots still manual** — see [Plan0-manual-tasks.md](Plan0-manual-tasks.md) |
| `sw.js` | **Partial → stronger** | Seller SW: API network-only; static cache-first; HTML network-first + offline (see prior PR notes) |
| `/offline` | **Done** | |
| Root `layout.tsx` fonts + manifest meta + SW | **Partial** | Seller SW on dashboard shell |

---

## §2 · Auth

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Split brand + form | **Partial → stronger** | `AuthShell` |
| Google OAuth + reset | **Partial → stronger** | Callback + opt-in UI when env enabled (Supabase dashboard manual) |

---

## §3–4 · Dashboard shell + home

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Sidebar + bottom nav + top bar | **Done** | |
| Orders badge realtime | **Done** | `useSellerPendingOrdersRealtime` — pending count + bell list subscribe to `orders` |
| Dashboard home stats + charts | **Partial → stronger** | Stats row + **`DashboardHomeInsights`** (14d trend `AreaChart`, fulfillment %, recent orders, low stock) |

---

## §5 · Products (inventory)

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Grid/list, Fuse search, filters | **Partial** | Fuse search + filters |
| Drawer edit, image upload, DnD reorder | **Partial → stronger** | **Edit/add in `Drawer`**; **`sort_order` + drag reorder** when sort = “Custom order”; migration `014_products_sort_order.sql` |

---

## §6 · Orders

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Kanban + DnD + realtime | **Done** | |
| Order drawer, timeline, wa.me | **Partial → stronger** | Shared `Drawer` |

---

## §7–8 · Conversations / Analytics

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| (§7–8) | **Done** | As before |

---

## §9 · Settings

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Tabbed settings + push | **Partial → stronger** | Dedicated **Notifications** tab with **`PushPrompt` settings panel**; other tabs unchanged structurally |

---

## §10 · Onboarding

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Multi-step wizard + confetti | **Partial → stronger** | **`canvas-confetti`** burst after successful seller creation |

---

## §11 · Admin

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Admin console | **Done** | |
| Live `platform_events` feed | **Partial → stronger** | **`AdminActivityFeed`** — emoji-prefixed mono lines + scroll stick-to-top when viewing newest |

---

## §12 · Public tracking

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Public track page | **Done** | |

---

## §13–14 · UI primitives + PWA install banner

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Primitives | **Done** | |
| `PWAInstallBanner` | **Done** | **`components/dashboard/PWAInstallBanner.tsx`** re-exports install prompt |

---

## §15–20 · Responsive, API errors, security

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Safe-area / bottom nav | **Partial → stronger** | Top bar **`pt-[env(safe-area-inset-top)]`**; shell bottom nav unchanged |
| Consistent API error shape | **Partial → stronger** | **`lib/api-json.ts`** (`apiOk` / `apiErr`); **seller/admin/push/billing/cron JSON routes migrated** — webhooks + **`/api/health`** intentionally unchanged |
| Security checklist | **Partial** | Ongoing ops — see manual tasks |

---

## §21 · Migrations

Compare `supabase/migrations/` to Plan0 SQL. Latest automation-related addition: **`014_products_sort_order.sql`**.

---

## Suggested improvements (prioritized)

1. Keep **this file** and **[Plan0-manual-tasks.md](Plan0-manual-tasks.md)** updated when shipping slices.
2. Google OAuth — Supabase Dashboard setup (manual).
3. Manifest screenshots — manual captures.
4. Dedicated maskable icons — design assets.
5. Consolidate seller settings tabs into strict Plan0 five-tab IA (optional UX project).
6. GitHub Issues / milestone — manual.
7. Viewport — keep zoom allowed for a11y unless product documents an exception.

---

*Last reviewed: Plan0 automation batch (realtime badge, insights, inventory drawer+DnD, API envelope, admin feed, onboarding confetti, notifications tab).*
