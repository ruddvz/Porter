# Porter — Improvement Plan

> **What this is:** A clear, prioritized plan for making Porter better — across UI/UX, system design, reliability, and business logic. It reviews the two open PRs, the current codebase state, and lists every gap found, with a simplified execution roadmap at the end.

## Roadmap status — complete

**Phases 1–4** from this document are implemented on **`main`** (merged via PR **#9**, May 2026). Remaining items below “Quick Reference” are **optional backlog** (nice-to-haves), not blockers.

**After pulling `main`, apply Supabase migrations through `012_realtime_platform_events.sql`** (see `README.md`). Enable **GitHub Pages** (Actions) if you want the static preview from `/docs`.

---

## Open PRs — What They Bring (historical context)

### PR #8 — Complete Master Plan (migration 006, analytics, PWA, push, plan gates, kanban DnD)
The biggest PR in the repo. It introduces:
- **DB migration 006** — product fields (`description`, `image_url`, `is_active`, `stock_quantity`), `preparing` order status, encrypted Razorpay key columns, `platform_settings` table, push subscription tables
- **Analytics page** — seller-facing charts (revenue, top products, customer split) via Recharts
- **PWA** — `manifest.json`, service worker (`sw.js`), install banner, push prompt for both seller dashboard and admin panel
- **Push notifications** — APIs for subscribe/send/admin-subscribe, VAPID key support
- **Seller settings overhaul** — tabbed UI (store, delivery, payments, bot, hours, Meta API, plan), optional field encryption
- **Kanban drag-and-drop** — `@dnd-kit` powering the live orders board
- **Plan gates** (`lib/plan-gates.ts`) — actual enforcement of Starter vs Growth limits (monthly order cap, nudge cron, custom intro)
- **Admin platform settings** — announcement banner + plan limit numbers via UI

### PR #7 — Professional README and MIT License
- Replaces minimal README with a full contributor-friendly overview
- Adds `LICENSE` file (MIT)

---

## Current State: What Exists and What Is Missing

### What Works Today (on `main`)
| Area | Status |
|------|--------|
| WhatsApp bot (order intake, Gemini parse, fuzzy match) | Working |
| Conversation state machine (5 states) | Working |
| Razorpay payment links + webhook | Working |
| Seller dashboard — live kanban (6 cols) | Working |
| Seller dashboard — order history + CSV export | Working |
| Seller dashboard — inventory CRUD | Working |
| Seller dashboard — settings (basic tabs) | Working |
| Admin panel (overview, orders, analytics, sellers, impersonation) | Working |
| Supabase Auth + RLS multi-tenancy | Working |
| Abandoned-order nudge cron | Working |

### What Is Missing / Incomplete (on `main`)
| Gap | Impact |
|-----|--------|
| **Seller analytics page** (`/dashboard/analytics`) does not exist | Sellers can't see their own data |
| **Plan gates not enforced** — `lib/plan-gates.ts` absent; Starter/Growth is only a badge | Revenue model has no teeth |
| **`bot_language` stored but never used** in Gemini prompts or replies | Setting does nothing |
| **UPI manual payment path** — type exists, no conversation branch | Breaks UPI sellers |
| **Product image upload** — UI links to "Supabase Storage in a later session" | Inventory is text-only |
| **Realtime order_items lag** — Realtime subscribes to `orders` only; line items arrive on 60s poll | New orders show without items for up to 1 minute |
| **Kanban is not draggable** — no DnD library | Must click action buttons to move cards |
| **No PWA / push notifications** | Dashboard loses to native apps on mobile |
| **Billing is a stub** — "Manage billing" shows a toast; no actual subscription flow | Can't monetize |
| **Secrets in plaintext** in `sellers` table — README says "encryption recommended" | Security risk |
| **No working hours support** — field missing from schema | Bot runs 24/7 with no off-hours message |
| **`cod_delivery_areas` / zone management** — hardcoded zone-string input | Awkward UX for multi-zone stores |
| **No order search on live board** — history page has search, kanban doesn't | Hard to find a specific live order |
| **No print bill / receipt** — `OrderDetailPanel` has a print button but no template | Unusable feature |

---

## UI / UX Improvements

### 1. Live Orders Board (Kanban)
**Problems**
- Cards are not draggable — sellers must hit small "Confirm / Preparing / Dispatch" buttons
- No search or filter on the live board
- `paid` orders are silently bucketed into the "Preparing" column — confusing label
- No sound or visual notification for truly new orders on desktop (sound is opt-in but silent until the first pointer interaction on the page)
- On mobile (< 768 px) all six columns stack — impossible to scan quickly
- No "awaiting payment" column — prepaid orders that haven't paid yet are in the `pending` column alongside COD orders, so sellers can't distinguish them

**Improvements**
- Add `@dnd-kit` drag-and-drop so cards can be dragged across columns (already planned in PR #8)
- Add a search bar above the board (filter by name, phone, or order #)
- Rename "Preparing" to "In Progress" and show a `paid` badge prominently on the card instead of hiding it in the column label
- Add an "Awaiting Payment" column for `pending` + `payment_status = unpaid` to separate prepaid from COD
- On mobile, show a horizontal scroll with sticky column headers instead of stacking
- Add a browser-native audio cue (`AudioContext` beep or a short MP3) that fires on new orders even before user interaction, using the Permissions API

### 2. Inventory
**Problems**
- Product image is a raw URL text field — sellers cannot upload photos
- No bulk price edit
- "Listed in bot" toggle makes it feel binary — there is no way to see *why* a product is hidden (stock, active flag, or not listed)
- No reorder / sort by category

**Improvements**
- Replace image URL field with a direct Supabase Storage upload widget (drag-drop or file picker); display thumbnail in the product card
- Add a bulk price edit (select multiple → set new price)
- Show a tooltip or sub-label on the "Listed in bot" toggle explaining current hiding reason
- Add sortable columns (name, price, stock, category) in the product list

### 3. Seller Analytics (missing — needs to be built)
**What to build**
- Revenue over time (7d / 30d / 90d) — bar chart
- Orders over time — line chart
- Top 5 products by revenue and quantity
- Customer breakdown (repeat vs new) — pie chart
- Average order value trend
- Peak hour heatmap (hour of day × day of week) — helps the seller staff correctly
- Plan-scoped history (Starter: 30 days; Growth: 90 days)

### 4. Settings
**Problems**
- WhatsApp number is shown as read-only with "contact support" — sellers cannot self-serve a number change
- The "Bot" tab has an intro message but no way to preview what a first-time customer would see on their phone
- "Subscription" tab is pure marketing copy — no current usage stats (orders this month vs plan limit)
- "Delivery" tab doesn't exist yet — zones, delivery fees, min order, off-hours message

**Improvements**
- Add a WhatsApp number change flow (with re-verification via Meta)
- Add a live WhatsApp-style preview in the Bot tab that re-renders as the seller types
- Show current-month usage (orders / limit) in the Subscription tab
- Build the Delivery tab: zone list editor, per-zone delivery fee, minimum order amount, working-hours schedule (day × open/close time), and an off-hours auto-reply message

### 5. Order Detail Panel
**Problems**
- Print bill button exists but the output is the entire page — no styled receipt
- No ability to send a manual WhatsApp message to the customer from the panel
- No order timeline showing when each status change happened (only `created_at` and `delivered_at` are tracked)
- No "Refund initiated" status for edge cases

**Improvements**
- Build a styled print receipt template (store name, items, total, payment method, date)
- Add a "Send WhatsApp" shortcut that opens `wa.me/<phone>?text=<pre-filled>` in a new tab
- Track status-change timestamps in a `order_events` table; render a timeline in the panel
- Add `refund_initiated` to `OrderStatus` with a note field

### 6. Mobile Dashboard Experience
**Problems**
- Dashboard sidebar is a slide-over on mobile — takes two taps to navigate
- Kanban columns require horizontal scroll on small screens
- No bottom navigation bar for mobile (common pattern for merchant apps)

**Improvements**
- Add a bottom nav bar on mobile with: Live Orders, History, Inventory, Settings — always visible
- On mobile, collapse kanban into a swimlane list (flat list sorted by status + time, with colored left border per status)
- Increase touch target sizes on all action buttons to at least 44 × 44 px

### 7. Onboarding
**Problems**
- Onboarding is a single long form — sellers with no Meta API experience are lost
- No validation feedback while typing (Meta phone ID format, access token live test)
- No confirmation / summary screen before submitting

**Improvements**
- Split into 3 steps: (1) Store basics, (2) Meta credentials + test connection, (3) Add first products
- Show a "Test connection" button after the Meta token is entered — it hits a `/api/seller/test-meta` endpoint that calls the Graph API and returns the linked number
- Add a "Skip for now" option for credentials so sellers can see the dashboard before connecting WhatsApp
- After successful onboarding, trigger `after-seller-created` API (already exists in PR #8) to subscribe to push

### 8. Admin Panel
**Problems**
- Platform analytics shows 30-day rolling charts, but there's no way to compare periods
- Admin seller detail page can deactivate and change plan, but can't reset the seller's WhatsApp token if it expires
- No bulk export of all sellers or all orders for accounting
- `platform_events` table is populated but never shown in a UI

**Improvements**
- Add period comparison to platform analytics (this month vs last month)
- Add "Rotate access token" action on the seller detail page
- Add CSV/XLSX export for all sellers and all orders (admin only)
- Build an `Activity` tab on the admin panel that streams `platform_events` in real time

---

## System / Architecture Improvements

### 1. Plan Gates — Wire Up Enforcement
**Current state:** `sellers.plan` is a DB column, but no application code blocks Starter sellers from using Growth features.

**What to build**
```
lib/plan-gates.ts
  getPlanLimits(plan) → { maxProducts, monthlyOrderCap, nudgeEnabled, customIntro, csvExport, analyticsHistory }
  checkMonthlyOrderCap(sellerId, plan) → boolean
  assertFeatureAccess(plan, feature) → throws PlanError
```
- Check `monthlyOrderCap` in `finalizeOrderFromContext` before inserting an order; reply with a friendly over-limit message
- Block CSV export button behind plan check in the orders history UI
- Restrict analytics date range based on plan
- Show upgrade prompts contextually (e.g., when a Starter seller hits the order cap or tries to export CSV)

### 2. Bot Language Preference
**Current state:** `sellers.bot_language` persists `auto | gujarati | hindi | english` but `lib/gemini.ts` and all reply strings ignore it.

**What to build**
- Pass `language` into `parseOrderText`, `parseFullOrder`, and `classifyIntent` Gemini prompts as a system instruction
- Maintain locale-keyed reply string maps for the hardcoded WhatsApp replies (`conversation.ts`)
- `auto` mode: detect language from the customer's message and reply in kind; cache per-conversation in `context.detectedLanguage`

### 3. UPI Manual Payment Path
**Current state:** `PaymentMethod = "upi_manual"` exists in types, but `conversation.ts` has no branch for it.

**What to build**
- Add `upi_manual` as a selectable option when `cod_enabled` is true and `razorpay_key_id` is absent
- Reply with the seller's UPI ID and request a screenshot / UTR number
- Add `awaiting_upi_confirmation` conversation state; after seller confirms from dashboard → mark `payment_status = paid` manually

### 4. Product Image Storage
**Current state:** `image_url` column exists (migration 006), but the UI has a plain text field.

**What to build**
- Create `product-images` Supabase Storage bucket (already in migration 006 SQL)
- Add a file upload component in `ProductModal` — resize to 800×800 px client-side before upload, store the public URL
- Display image thumbnails in inventory card grid and in the WhatsApp bot reply (MMS-style image message via Meta API)

### 5. Realtime Order Items
**Current state:** `useRealtimeOrders` subscribes to the `orders` table only. When a new order arrives via Realtime, its `order_items` don't exist yet in the local state — they arrive only on the 60-second polling cycle.

**What to build**
- Subscribe to `order_items` via a second Realtime channel, filtered by `seller_id` (join via the `orders` table)
- On an `INSERT` event for `order_items`, merge the item into the matching order in local state immediately
- This eliminates the "Order received, items TBD" card flash

### 6. Working Hours & Off-Hours Bot
**Current state:** No working hours concept anywhere.

**What to build**
- Add `working_hours` JSONB column to `sellers` (already in migration 006 — `{"mon":{"open":"09:00","close":"22:00"}, ...}`)
- In `handleIncomingCustomerMessage`, check current time (seller's timezone via `sellers.city` → timezone lookup) against `working_hours`
- If outside hours, reply with the configurable off-hours message and set conversation state to `idle`
- Resume conversation automatically when the shop re-opens (or let the customer message again)

### 7. Seller Billing / Subscription
**Current state:** Completely stubbed — "Manage billing" shows a toast.

**What to build** (Phase 2 scope)
- Integrate Razorpay Subscriptions (since Razorpay is already in the stack) or Stripe
- `POST /api/billing/create-subscription` — create a subscription for the seller
- Webhook handler for subscription events: `subscription.activated`, `subscription.cancelled`, `subscription.charged`
- Automatically update `sellers.plan` on successful charge / cancellation
- Show current plan, billing date, and invoice history in the Subscription tab

### 8. Security Hardening
**Current state:** Razorpay key ID/secret and Meta access tokens live in plaintext in `sellers` table.

**What to build**
- Use `PORTER_CREDENTIAL_SECRET` (already in `.env.example` and migration 006) to AES-256-GCM encrypt `razorpay_key_secret` and `meta_access_token` at rest
- `lib/field-crypto.ts` (already scaffolded in PR #8) — use it for encrypt-on-save and decrypt-on-read
- Add a cron job to rotate Meta long-lived tokens before their 60-day expiry

### 9. Order Events / Audit Trail
**Current state:** Only `created_at` and `delivered_at` are recorded. No intermediate timestamps.

**What to build**
- `order_events` table: `(id, order_id, status, changed_by, changed_at, note)`
- Write a row on every status transition (webhook, dashboard action, or bot action)
- Render a collapsible timeline in `OrderDetailPanel`
- Use for future refund/dispute evidence

### 10. Error Handling & Observability
**Current state:** Webhook handlers use `console.error` and `waitUntil`; there is no structured logging, no alerting, and no retry on transient failures.

**What to build**
- Add structured `console.log` with a `{ event, seller_id, order_id, duration_ms }` shape so Vercel log drain / Axiom can index them
- Wrap Razorpay payment link creation in a retry loop (3 attempts, exponential backoff) before failing the order
- Add a `bot_errors` table (or use `platform_events`) to log parse failures and intent misclassifications — surfaces training data for Gemini prompt improvement
- Add a `/api/health` endpoint that verifies Supabase connectivity and returns `200 OK` or `503`

---

## Prioritized Execution Roadmap

### Phase 1 — Fix Critical Gaps (highest impact, low risk)
These are bugs or missing features that break the core product promise.

| # | Task | Files Touched | Why Now |
|---|------|---------------|---------|
| 1 | **Merge PR #8** — plan gates, analytics, PWA, DnD, push | 50+ files | Most of the work is done; just needs review + migration applied |
| 2 | Wire `bot_language` into Gemini prompts and reply strings | `lib/gemini.ts`, `lib/conversation.ts` | The setting exists and sellers expect it to work |
| 3 | Fix Realtime `order_items` lag (subscribe to both tables) | `lib/hooks/useRealtimeOrders.ts` | Cards flash without items — confusing for sellers |
| 4 | Build product image upload to Supabase Storage | `app/dashboard/inventory/ui.tsx`, `supabase` bucket | `image_url` column and bucket policy already in migration 006 |
| 5 | Enforce plan gates in `finalizeOrderFromContext` and history CSV | `lib/plan-gates.ts`, `lib/conversation.ts`, `app/dashboard/orders/ui.tsx` | Without enforcement, the paid plan has no value |

### Phase 2 — UX Polish (improves daily seller experience)

| # | Task | Files Touched |
|---|------|---------------|
| 6 | "Awaiting Payment" kanban column for unpaid prepaid orders | `app/dashboard/ui.tsx` |
| 7 | Mobile bottom nav bar replacing sidebar on small screens | `components/dashboard/ShopDashboardShell.tsx` |
| 8 | Styled print receipt in `OrderDetailPanel` | `components/orders/OrderDetailPanel.tsx` |
| 9 | Onboarding step-by-step wizard + Meta connection test | `app/onboarding/ui.tsx`, `app/api/seller/test-meta/route.ts` |
| 10 | Delivery tab in settings (zones, fees, working hours, off-hours reply) | `app/dashboard/settings/ui.tsx`, `supabase/migrations/007_*.sql` |
| 11 | Usage stats in Subscription tab (orders this month vs cap) | `app/dashboard/settings/ui.tsx` |
| 12 | Kanban live search bar (name / phone / order number) | `app/dashboard/ui.tsx` |

### Phase 3 — System Depth (reliability, security, monetization)

**Done (MVP):** Encryption paths, `order_events`, UPI-first checkout, Razorpay retries + webhook events, **admin orders CSV** (`/api/admin/export/orders`), **live `platform_events`** after migrations **010–012**, **billing stub** (`GET /api/billing/status` — manual SaaS billing explained). Automated Razorpay Subscriptions for Porter billing is **not** wired; sellers still upgrade manually.

| # | Task | Files / notes |
|---|------|----------------|
| 13 | Encrypt Razorpay + Meta secrets at rest | `field-crypto.ts`, `seller-credentials.ts`, `encrypt-payments` API |
| 14 | `order_events` + Activity UI | `009_order_events.sql`, `OrderDetailPanel` |
| 15 | UPI manual path | `conversation.ts`, `bot-locale.ts`, Kanban |
| 16 | Razorpay retries + webhook logging | `lib/razorpay.ts`, `webhook/razorpay` |
| 17 | Admin CSV + platform activity | `app/api/admin/export/orders`, `AdminActivityFeed`, **010** policy + **012** realtime |
| 18 | Billing integration | Stub: `app/api/billing/status`; Growth tab calls it |

### Phase 4 — Growth Features

| # | Task | Status |
|---|------|--------|
| 19 | Peak-hour heatmap | Seller `/dashboard/analytics` |
| 20 | Broadcast WhatsApp | `POST /api/seller/broadcast`, Settings → Growth |
| 21 | Referral + loyalty | Growth tab; DB trigger on delivered; bot captures referral word |
| 22 | Rider label | Order panel + optional on `/track` |
| 23 | Scheduled orders | `scheduled_for` column + bot hints (`kal subah`, etc.) |
| 24 | Public tracking | `/track/[slug]` + RPC `get_order_by_track_slug` |

---

## Quick Reference: All Improvement Suggestions

### UI/UX
- Draggable kanban cards (DnD)
- "Awaiting Payment" column on kanban
- Kanban live search bar
- Mobile bottom nav bar
- Mobile swimlane view of orders
- Larger touch targets (44×44 px minimum)
- Seller analytics page (charts, heatmap)
- Product image upload widget with thumbnail preview
- Bulk price edit in inventory
- "Listed in bot" tooltip explaining hiding reason
- Sortable/filterable inventory table
- 3-step onboarding wizard with Meta connection test
- Bot intro preview as WhatsApp mock in settings
- Working hours / delivery tab in settings
- Current-month usage bar in Subscription tab
- WhatsApp shortcut button in OrderDetailPanel
- Order status timeline in OrderDetailPanel
- Styled print receipt
- Period comparison in admin analytics
- Real-time `platform_events` activity feed in admin

### Systems / Backend
- Enforce plan gates in conversation flow and dashboard
- Wire `bot_language` into Gemini prompts and reply strings
- Fix `order_items` Realtime lag
- Product image upload to Supabase Storage
- UPI manual payment path in conversation
- Working hours check in bot with off-hours reply
- AES-256-GCM encryption for Razorpay + Meta secrets
- `order_events` audit trail
- Razorpay Subscription integration for billing
- Structured logging with Vercel log drain
- Razorpay payment-link creation retry loop
- Meta token auto-rotation cron
- `/api/health` endpoint
- Admin bulk CSV/XLSX export

---

*Last updated: May 2026. Roadmap Phases 1–4 delivered on `main`; backlog items below are optional follow-ups.*
