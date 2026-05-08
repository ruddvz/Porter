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
| Industrial dark + `#25D366` accent | **Partial** | Porter `porter-*` Tailwind is canonical; **`globals.css` adds Plan0 semantic aliases** (`--bg-base`, `--accent`, …) mapped to `--plan0-*` |
| Geist + DM Mono (India / Latin) | **Partial** | **Geist Sans + Geist Mono** on root `<html>`; **DM Mono** for `--font-dm-mono`; Tailwind `sans` prefers DM Sans where loaded (dashboard/marketing). **Arabic / RTL stack intentionally out of scope** for India-first Porter |
| CSS variables `--bg-base`, `--accent`, … | **Partial → stronger** | Porter tokens + **`--plan0-*` bridge + `--bg-base` / `--accent` aliases** + safe-area vars |
| `manifest.json` | **Partial** | Multiple **icon sizes** (72–512) + shortcuts; **screenshots still manual** — see [Plan0-manual-tasks.md](Plan0-manual-tasks.md) |
| `sw.js` | **Partial → stronger** | Same-origin GET: `/api/*` network-only; `/_next/static` + common static extensions cache-first; HTML network-first with `/offline` fallback **without caching HTML** (avoids stale sessions on shared devices) |
| `/offline` | **Done** | `app/offline/page.tsx` + SW precache / HTML navigate fallback |
| Root `layout.tsx` fonts + manifest meta + SW | **Partial** | **Geist** + **DM Mono** on root `html`; title template, `viewport`, Apple meta, skip link, unhandled-rejection toast; seller SW on **dashboard shell** only |

---

## §2 · Auth

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Split brand + form layout | **Partial → stronger** | **`AuthShell`** split panel on `lg+` for login, signup, forgot-password; Porter tokens + `Card` + `Input` |
| Google OAuth + reset password | **Partial → stronger** | **Forgot password** at `/auth/forgot-password`. **`/auth/callback`** + **`signInWithOAuth`** on login/signup when **`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`** (configure provider + redirect URLs in Supabase — manual) |

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
| Tabbed settings + push | **Partial → stronger** | Dedicated **Notifications** tab with **`PushPrompt` settings panel**; other tabs unchanged structurally (optional future: strict Plan0 five-tab IA) |

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

1. Keep **this file** and **[Plan0-manual-tasks.md](Plan0-manual-tasks.md)** updated when merging Plan0-related PRs.
2. **Google OAuth** — Supabase Dashboard: enable Google provider + redirect URLs (`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` in app env).
3. **Manifest screenshots** — add `screenshots` entries once you have stable marketing captures (Plan0 §1.1).
4. **Dedicated maskable icons** — replace or pad assets per adaptive-icon guidelines.
5. **Single service worker story** — document why seller SW is dashboard-scoped vs admin; optional shared registration if product allows.
6. **Consolidate seller settings tabs** into strict Plan0 five-tab IA (optional UX project).
7. **GitHub Issues / milestone** — one issue per remaining polish item for traceability.
8. **Viewport** — Plan0 suggests `maximumScale: 1`; prefer allowing zoom for accessibility unless you document an exception.

---

*Last reviewed: merged Plan0 OAuth PR + automation PR into main.*
