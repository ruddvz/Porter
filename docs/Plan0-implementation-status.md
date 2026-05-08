# Plan 0 — Implementation status (living)

**Companion:** [docs/Plan0.md](Plan0.md) (full spec). **This file** is the single checklist of **what exists in the repo** vs that spec.

**“Pixel perfect” reality:** Plan0 is a long product brief (auth split layout, every chart RPC, full icon ladder, WCAG audit, Lighthouse 90+, etc.). This repo now covers **the same capabilities** for most seller flows, but **not every literal CSS value, asset size, and QA line item** from Plan0 is cloned 1:1. Treat Plan0 as the **north star**; this matrix as **what shipped**.

This file answers: **“What was done for Plan 0?”** Git history only shows two commits because **those commits only added the spec** (`docs/Plan0.md`). Almost everything else in the repo was built earlier under **roadmap / improvement-plan PRs** (#6–#12, etc.) with different commit messages — same product goals as Plan0, but **not labeled “Plan0” in git**.

Use this matrix as the single place to see **Plan0 § vs codebase**. Update it when you ship slices.

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
| Industrial dark + `#25D366` accent | **Partial** | Porter uses green accent + `porter-bg-*` palette; not the exact Plan0 neutral ramp (`#0a0a0a` / `#111` …) |
| Geist + DM Mono (India / Latin) | **Partial** | **Geist Sans + Geist Mono** on root `<html>`; **DM Mono** for `--font-dm-mono`; Tailwind `sans` prefers DM Sans where loaded (dashboard/marketing). **Arabic / RTL stack intentionally out of scope** for India-first Porter |
| CSS variables `--bg-base`, `--accent`, … | **Partial** | Porter `porter-*` Tailwind is canonical; **`--plan0-*` bridge + safe-area** in `globals.css` for gradual alignment |
| `manifest.json` | **Partial** | Multiple **icon sizes** (72–512) + `purpose` any/maskable (reuses PNG assets); shortcuts incl. chats; **no screenshots** yet |
| `sw.js` | **Partial → stronger** | Same-origin GET routing: `/api/*` network-only; `/_next/static` + common static extensions cache-first; HTML navigations network-first with `/offline` fallback (does not cache HTML responses to avoid stale sessions on shared devices) |
| `/offline` | **Done** | `app/offline/page.tsx` + SW precache / HTML navigate fallback |
| Root `layout.tsx` fonts + manifest meta + SW | **Partial** | **Geist** + **DM Mono** on root `html`; title template, `viewport`, Apple meta, skip link, unhandled-rejection toast; seller SW on **dashboard shell** only |

---

## §2 · Auth (login / signup / OAuth / reset)

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Split brand + form layout | **Partial → stronger** | **`AuthShell`** split panel on `lg+` for login, signup, forgot-password; Porter tokens + `Card` + `Input` |
| Google OAuth + reset password | **Partial → stronger** | **Forgot password** at `/auth/forgot-password`. **`/auth/callback`** + **`signInWithOAuth`** on login/signup when **`NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`** (configure provider + redirect URLs in Supabase) |

---

## §3–4 · Dashboard shell + home

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Sidebar + bottom nav + top bar | **Done** | `ShopDashboardShell`, `Sidebar`, mobile bottom nav |
| Orders badge realtime | **Partial** | Pending counts from server; verify full Plan0 “new orders” subscription |
| Dashboard home stats + charts | **Partial** | Live data; layout/styling may differ from Plan0 wireframe |

---

## §5 · Products (inventory)

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Grid/list, Fuse search, filters | **Partial** | Inventory at `/dashboard/inventory`; feature set evolving |
| Drawer edit, image upload, DnD reorder | **Partial** | Image upload / bulk price / sort may exist in part — compare to Plan0 |

---

## §6 · Orders (kanban)

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Kanban + DnD + realtime | **Done** | `@dnd-kit`, columns, swimlane mobile work from consolidated UX PRs |
| Order drawer, timeline, wa.me | **Partial → stronger** | **`OrderDetailPanel`** now uses shared **`Drawer`**; timeline + print receipt (dark Porter-themed print CSS) |

---

## §7 · Conversations

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Seller `/dashboard/conversations` | **Done** | Split list + thread, masked phone, quick replies, **Supabase Realtime** on `conversation_messages` |
| `/api/wa/send` | **Done** | `app/api/wa/send/route.ts` — session-scoped seller, `sendMessage` + DB log |
| Message persistence | **Done** | `013_conversation_messages.sql`; webhook logs **inbound** after bot handling |

---

## §8 · Analytics

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Seller `/dashboard/analytics` | **Done** | Charts + date range (verify RPC parity with Plan0 SQL) |

---

## §9 · Settings

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Tabbed settings + push | **Partial** | Broad coverage; compare each Plan0 tab to UI |

---

## §10 · Onboarding

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Multi-step wizard + confetti | **Partial** | Onboarding exists; step UX may differ |

---

## §11 · Admin

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Admin console | **Done** | Overview, sellers, analytics, etc. |
| Live `platform_events` feed | **Partial** | Table/migrations exist; confirm full Plan0 “activity stream” UI |

---

## §12 · Public tracking `/track/[orderId]`

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Public track page | **Done** | Route uses slug param; polling / UX vs Plan0 |

---

## §13–14 · UI primitives + PWA install banner

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Button, Input, Modal, Toast, Skeleton, EmptyState | **Done** | Under `components/ui/` |
| Drawer, ConfirmDialog | **Done** | `Drawer` + `ConfirmDialog`; design-system demos; inventory + order history confirms; **order detail panel** uses `Drawer` |
| `PWAInstallBanner` | **Partial** | **`InstallPrompt`** in dashboard fulfills same role |

---

## §15–20 · Responsive, performance, a11y, errors, security

| Plan0 item | Status | Notes |
|-------------|--------|--------|
| Safe-area / bottom nav | **Partial** | `env(safe-area-inset-bottom)` used in shell |
| Consistent API error shape | **Partial** | Audit routes vs Plan0 `{ data, error }` |
| Security checklist | **Partial** | README + webhooks; keep reviewing RLS and secrets |

---

## §21 · Migrations in Plan0

Compare `supabase/migrations/` to Plan0 SQL (`push_subscriptions`, `platform_events`, `sort_order`, RPCs). Treat Plan0 as a **checklist**, not automatic truth.

---

## Why it felt like “only two commits”

| Commit | What it actually did |
|--------|----------------------|
| `34c2c06` | Added the Plan0 **document** as `docs/Plan0` (message text is misleading) |
| `3c4ceb0` | Renamed to `docs/Plan0.md` |

No application code was committed under the name “Plan0” before offline/PWA follow-up work.

---

## Suggested improvements (prioritized)

1. **Keep this file updated** when merging Plan0-related PRs so chat history is not the source of truth.
2. **Google OAuth** — Implemented: `/auth/callback` + opt-in login/signup buttons when `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`; enable the Google provider and redirect URLs in Supabase.
3. **Manifest screenshots** — add `screenshots` entries once you have stable marketing captures (Plan0 §1.1).
4. **Dedicated maskable icons** — replace reused `icon-192.png` entries with properly padded maskable assets per size.
5. **Single service worker story** — document why seller SW is dashboard-scoped vs admin; optional shared registration pattern if product allows.
6. **GitHub Issues / milestone** — one issue per Plan0 §22 queue item for traceability.
7. **Viewport** — Plan0 suggests `maximumScale: 1`; that hurts accessibility — prefer strong layout + allow zoom unless you have a documented exception.

---

*Last reviewed: generated with codebase audit; update on each meaningful merge.*
