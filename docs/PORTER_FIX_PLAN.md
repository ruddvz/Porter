# Porter — Complete Repo Fix Plan, UI/UX Audit, iOS PWA Upgrade Roadmap

**Repo:** https://github.com/ruddvz/Porter  
**Audit date:** 2026-06-04  
**Target outcome:** A polished, reliable, mobile-first WhatsApp dark-store SaaS that feels excellent as an iOS PWA, works cleanly for Indian/local-store workflows, and is safe for real sellers to use.

---

## 0. Agent Operating Contract — Read This First

You are the implementation agent for Porter. Your job is not to do one quick patch and stop. Your job is to work through this plan until the entire plan is complete.

### Non-negotiable execution rules

1. **Do not stop after one task.** Continue phase by phase until every checklist item is complete or explicitly blocked.
2. **Keep a running progress file.** Create or update `docs/AGENT_PROGRESS.md` after every meaningful change.
3. **Always inspect current code before editing.** Some older docs in the repo are now stale. Do not blindly trust `IMPROVEMENTS.md` without comparing it to current `main`.
4. **Do not remove working features.** Preserve the current WhatsApp ordering, seller dashboard, admin tools, PWA files, Supabase integrations, Razorpay integration, Gemini integration, and tracking flows unless a change is intentionally listed here.
5. **Use small, safe PR-sized steps.** Implement a focused group of changes, validate, commit, then continue.
6. **Run validation after every phase.** At minimum: lint, typecheck, build, route smoke test, and manual mobile viewport review.
7. **Do not ask the user for “next step.”** Pick the next unchecked item and continue.
8. **Only stop for real blockers:** missing external credentials, destructive database changes that require owner approval, legal/security concerns, or a failing dependency that cannot be resolved safely.
9. **Document every assumption.** If a feature depends on Meta WhatsApp, OpenWA, Razorpay, Supabase, VAPID, or Gemini credentials, note whether it was fully tested or mocked.
10. **Prioritize mobile first.** Porter’s seller experience must feel excellent on iPhone Safari and installed iOS PWA mode.

### Definition of done for the full plan

The plan is complete only when:

- [ ] All P0 issues are fixed.
- [ ] All P1 improvements are implemented or clearly documented as intentionally deferred.
- [ ] All P2 polish items are implemented where practical.
- [ ] The app passes `npm run lint`.
- [ ] The app passes `npm run typecheck`.
- [ ] The app passes `npm run build`.
- [ ] Route smoke tests pass for marketing, auth, onboarding, dashboard, admin, offline, tracking, privacy, and terms routes.
- [ ] iPhone Safari and installed PWA mode have been manually checked.
- [ ] No critical UI is hidden behind the notch, Dynamic Island, browser bars, or home indicator.
- [ ] Touch targets are reliable on iPhone SE, standard iPhone, and Pro Max sizes.
- [ ] The live-order dashboard remains usable with 0 orders, 1 order, 50 orders, and 200+ orders.
- [ ] Admin impersonation, seller auth, API endpoints, and webhook handlers have been security-reviewed.
- [ ] `README.md`, `.env.example`, and deployment docs match the final product.
- [ ] `docs/AGENT_PROGRESS.md` explains exactly what was completed, what was deferred, and how to test the app.

---

## 1. Current Repo Snapshot

Based on the current public repo, Porter is not a blank starter project. It is already a substantial Next.js/Supabase product.

### Existing product direction

Porter is a **WhatsApp-first dark-store SaaS** for sellers. The core concept is that customers order through WhatsApp conversations while sellers manage live orders, inventory, payments, automation, and admin operations through a web dashboard.

### Existing stack

Current stack and integrations include:

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and RLS
- Meta WhatsApp Cloud API
- OpenWA bridge support
- Razorpay payment integration
- Google Gemini integration
- Recharts
- Fuse.js fuzzy search
- Lucide icons
- web-push / VAPID notifications
- Vercel functions and cron-style endpoints

### Existing important app areas

The repo currently includes these major areas:

- `app/(marketing)` — marketing/home experience
- `app/admin` — admin platform views
- `app/api` — internal, seller, push, WhatsApp, cron, webhook, and health endpoints
- `app/auth` — auth pages
- `app/dashboard` — seller dashboard
- `app/design-system` — design-system preview route
- `app/offline` — offline experience
- `app/onboarding` — seller onboarding
- `app/privacy` and `app/terms`
- `app/track/[slug]` — order tracking route
- `components/dashboard` — seller dashboard shell, topbar, push prompt, PWA install banner, sidebar, etc.
- `lib` — integrations, server helpers, auth, WhatsApp, Razorpay, Gemini, catalog, plan gates, order helpers, encryption utilities
- `public` — manifests, service workers, icons, widget, and PWA assets
- `supabase` — migrations and database docs

### Important warning about the existing `IMPROVEMENTS.md`

`IMPROVEMENTS.md` is useful historical context, but it is partially stale. It says earlier phases are complete and also contains older “missing items” that appear to have been implemented later, such as mobile dashboard improvements, drag-and-drop live board behavior, analytics route work, PWA prompts, push prompts, and safe-area-aware navigation.

Do not use old TODOs blindly. Re-audit current code and update the plan based on the current app.

---

## 2. Product Standard Porter Should Reach

Porter should feel like a high-quality operations app for small and medium sellers who live on WhatsApp.

### Product promise

A seller should be able to:

1. Sign up.
2. Connect WhatsApp or use demo/mock mode.
3. Add store settings, inventory, categories, pricing, delivery zones, and payment settings.
4. Receive customer WhatsApp orders.
5. Convert messages into structured orders.
6. Accept, prepare, dispatch, deliver, cancel, refund, or follow up on orders.
7. Notify customers automatically.
8. Track abandoned or pending orders.
9. See sales, inventory, and operational health.
10. Install the dashboard as an iPhone PWA and use it like a native operations app.

### Design quality target

Porter should feel:

- Fast
- Calm
- Professional
- Trustworthy
- Seller-first
- Mobile-first
- iOS PWA-native
- Clear under pressure
- Reliable when the shop is busy
- Useful even for sellers who are not technical

### Design anti-goals

Avoid:

- Desktop-first tables on mobile
- Cramped bottom navigation
- Tiny touch targets
- Too much neon/dark-only styling
- Overusing decorative typography for operational UI
- Hidden controls
- Ambiguous order statuses
- Confusing automation states
- Unclear plan-gated features
- Silent failures in WhatsApp, payment, push, or webhook flows
- Service worker caching that makes the app feel stale or broken

---

## 3. P0 Blockers and High-Risk Issues

These must be handled first.

### P0.1 Fix route/nav mismatch for dashboard categories

**Problem:** The dashboard shell navigation includes a Categories destination, but the currently visible `app/dashboard` folder listing does not clearly show a `categories` route. This may create a broken nav link or 404.

**Tasks:**

- [ ] Verify whether `/dashboard/categories` exists locally.
- [ ] If missing, create `app/dashboard/categories/page.tsx`.
- [ ] If the category feature exists elsewhere, wire the nav to the correct route.
- [ ] Add loading and error states.
- [ ] Add mobile-first category management UI.
- [ ] Add route smoke test for `/dashboard/categories`.

**Acceptance:**

- [ ] Clicking Categories in desktop sidebar works.
- [ ] Clicking Categories in mobile bottom nav or More menu works.
- [ ] Route does not 404.
- [ ] Empty category state is useful.
- [ ] Seller can add, edit, archive, reorder, and assign products to categories.

---

### P0.2 Replace stale improvement tracking with this current plan

**Problem:** The old `IMPROVEMENTS.md` contains completed historical work and older missing items. Future agents may waste time re-implementing already-completed features.

**Tasks:**

- [ ] Rename old file to `docs/HISTORICAL_IMPROVEMENTS.md` or clearly mark it as historical.
- [ ] Add this plan as `docs/PORTER_FIX_PLAN.md`.
- [ ] Add `docs/AGENT_PROGRESS.md`.
- [ ] Add a short pointer in `README.md`: “Current implementation plan lives in `docs/PORTER_FIX_PLAN.md`.”
- [ ] Add a progress table with P0/P1/P2 status.

**Acceptance:**

- [ ] New agents know exactly where to start.
- [ ] No duplicate or conflicting TODO sources remain.
- [ ] Historical docs are preserved but not treated as current source of truth.

---

### P0.3 Add missing project validation scripts

**Problem:** `package.json` currently has core scripts like dev/build/start/lint, but the project needs explicit typecheck, test, route smoke, and formatting scripts for reliable agent work.

**Tasks:**

- [ ] Add `npm run typecheck` using `tsc --noEmit`.
- [ ] Add `npm run format` or `npm run format:check` if Prettier is adopted.
- [ ] Add `npm run test` with Vitest or another lightweight runner.
- [ ] Add `npm run test:e2e` with Playwright.
- [ ] Add `npm run verify` that runs lint, typecheck, tests, and build.
- [ ] Add CI workflow if missing.

**Suggested scripts:**

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "verify": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

**Acceptance:**

- [ ] `npm run verify` exists.
- [ ] CI runs `npm run verify`.
- [ ] Agent progress file records latest verification result.

---

### P0.4 Audit large dashboard file and split safely

**Problem:** `app/dashboard/ui.tsx` is very large and appears to contain live board logic, mobile board/list UI, order cards, drag-and-drop behavior, actions, helpers, and view state in one file. This increases bug risk.

**Tasks:**

- [ ] Map all components/functions inside `app/dashboard/ui.tsx`.
- [ ] Split into smaller files without changing behavior first.
- [ ] Suggested structure:
  - `app/dashboard/components/LiveOrdersBoard.tsx`
  - `app/dashboard/components/OrderColumn.tsx`
  - `app/dashboard/components/OrderCard.tsx`
  - `app/dashboard/components/MobileOrderList.tsx`
  - `app/dashboard/components/OrderDetailDrawer.tsx`
  - `app/dashboard/components/OrderQuickActions.tsx`
  - `app/dashboard/hooks/useOrderBoardFilters.ts`
  - `app/dashboard/hooks/useOrderMutations.ts`
  - `app/dashboard/utils/orderFormatting.ts`
- [ ] Preserve all existing exports and behavior.
- [ ] Add regression tests around status transitions and filtering.

**Acceptance:**

- [ ] No behavior regression.
- [ ] Each component has a clear responsibility.
- [ ] Live board remains realtime.
- [ ] DnD still works on desktop.
- [ ] Mobile list mode still works.

---

### P0.5 Fix performance risk from fetching too many live orders by default

**Problem:** The dashboard page currently fetches a large batch of recent orders with nested order items. This may be acceptable for a demo but can become slow or janky for real sellers.

**Tasks:**

- [ ] Replace hardcoded large fetch with a status/date-scoped query.
- [ ] Default live board to active statuses only.
- [ ] Move historical orders to `/dashboard/orders` or History route with pagination.
- [ ] Add cursor or page-based pagination.
- [ ] Add server-side limits and indexes where needed.
- [ ] Add skeleton states and incremental loading.
- [ ] Add “Load older orders” button.

**Acceptance:**

- [ ] Dashboard initial load does not fetch unnecessary history.
- [ ] Active orders load quickly.
- [ ] History remains searchable/paginated.
- [ ] 200+ order test does not freeze mobile Safari.

---

### P0.6 Security audit admin impersonation and privileged operations

**Problem:** Admin impersonation and service-role-backed flows are powerful and risky.

**Tasks:**

- [ ] Audit all admin routes and server actions.
- [ ] Ensure service-role Supabase client is never imported into client components.
- [ ] Ensure impersonation cookie is signed, scoped, short-lived, and revocable.
- [ ] Add visible impersonation banner in seller dashboard.
- [ ] Add “Stop impersonating” action.
- [ ] Log impersonation start/stop events.
- [ ] Log admin user ID, target seller ID, timestamp, and reason.
- [ ] Prevent impersonation in production unless admin role is verified server-side.

**Acceptance:**

- [ ] Admin impersonation cannot be activated by non-admin users.
- [ ] Every impersonated action is visibly marked and auditable.
- [ ] No service-role secrets leak to the client bundle.

---

### P0.7 Harden webhook and payment idempotency

**Problem:** WhatsApp and payment webhooks can be retried, duplicated, delayed, or delivered out of order.

**Tasks:**

- [ ] Verify Meta webhook signature/secret validation.
- [ ] Verify Razorpay webhook signature validation.
- [ ] Add idempotency table or event de-duplication.
- [ ] Store external event IDs.
- [ ] Ensure repeated webhooks do not duplicate orders, payments, messages, or notifications.
- [ ] Add tests for duplicate webhook payloads.
- [ ] Add structured logging for webhook failures.

**Acceptance:**

- [ ] Duplicate WhatsApp event creates no duplicate order.
- [ ] Duplicate Razorpay event creates no duplicate payment record.
- [ ] Invalid signature is rejected.
- [ ] Webhook failure can be debugged from logs.

---

### P0.8 Fix PWA metadata and install correctness

**Problem:** The repo has PWA files, but every manifest, service worker, layout metadata, Apple-specific tag, icon, and safe-area behavior must be verified together.

**Tasks:**

- [ ] Verify `public/manifest.json` is linked from root layout.
- [ ] Verify `public/admin-manifest.json` is linked only where intended.
- [ ] Verify `public/sw.js` and `public/admin-sw.js` scopes do not conflict.
- [ ] Add or verify Next metadata for PWA.
- [ ] Add `viewport-fit=cover` through Next viewport config.
- [ ] Verify Apple mobile web app tags.
- [ ] Verify status bar style.
- [ ] Verify icons: 180, 192, 512, maskable, and high-quality rounded icons.
- [ ] Verify theme colors match light/dark UI.
- [ ] Verify offline route is reachable from service worker fallback.

**Acceptance:**

- [ ] App installs correctly on iPhone.
- [ ] Installed PWA opens without browser chrome.
- [ ] No content is hidden behind status bar or home indicator.
- [ ] Manifest passes Lighthouse PWA checks where supported.

---

## 4. iOS PWA Upgrade Requirements

Porter must feel like a real iPhone app when installed.

### 4.1 Viewport and safe areas

Add or verify a proper viewport export in `app/layout.tsx`.

```ts
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#07111f"
};
```

Important: avoid blocking accessibility zoom unless there is a strong reason. If `maximumScale: 1` causes accessibility problems, remove it and fix iOS input zoom another way by ensuring input font sizes are at least 16px.

### 4.2 Global CSS safe-area tokens

Add safe-area utilities in `app/globals.css`.

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --app-header-height: 64px;
  --app-bottom-nav-height: 72px;
}

html,
body {
  min-height: 100%;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  text-rendering: optimizeLegibility;
}

body {
  overscroll-behavior-y: none;
}

input,
select,
textarea,
button {
  font: inherit;
}

input,
select,
textarea {
  font-size: 16px;
}

.safe-top {
  padding-top: var(--safe-top);
}

.safe-bottom {
  padding-bottom: var(--safe-bottom);
}

.app-bottom-spacer {
  padding-bottom: calc(var(--app-bottom-nav-height) + var(--safe-bottom));
}
```

### 4.3 Fixed header and bottom nav behavior

Current code already uses safe-area padding in places, but verify all app shells.

**Tasks:**

- [ ] Ensure sticky topbar does not double-pad inside Safari tab mode.
- [ ] Ensure installed PWA mode does not hide title behind status bar.
- [ ] Ensure bottom nav never covers primary action buttons.
- [ ] Add bottom padding to all dashboard pages.
- [ ] Add `scroll-padding-bottom` for pages with fixed bottom nav.
- [ ] Test keyboard open/close on forms.
- [ ] Ensure drawers/sheets use `100dvh` and safe-area bottom padding.

### 4.4 Touch target standard

Every interactive control must meet iPhone touch standards.

**Rules:**

- Minimum target: 44px × 44px.
- Icon-only buttons need accessible labels.
- Destructive actions need confirmation or undo.
- Swipe gestures must not be the only way to complete an action.
- Drag-and-drop must have a non-drag fallback.

**Audit targets:**

- [ ] Topbar menu button
- [ ] Notification bell
- [ ] Bottom nav items
- [ ] Sidebar items
- [ ] Order status chips
- [ ] Search clear button
- [ ] Order quick actions
- [ ] Inventory stock steppers
- [ ] Category reorder controls
- [ ] Drawer close buttons
- [ ] Date range buttons
- [ ] Payment/refund/cancel buttons

### 4.5 PWA install and push education

Push prompts are currently plan-gated. That may be correct, but the UX must clearly explain the behavior.

**Tasks:**

- [ ] If push is Growth-only, show “Push notifications are included in Growth” before asking for permission.
- [ ] If seller is not installed as PWA, show “Install Porter first to receive iPhone push alerts.”
- [ ] If permission is denied, do not keep asking. Show instructions to re-enable notifications in iOS settings.
- [ ] If VAPID key is missing, show a developer/admin warning only in non-production or admin diagnostics.
- [ ] Add notification test button in Settings.
- [ ] Add clear success/failure states.

### 4.6 Service worker update lifecycle

**Tasks:**

- [ ] Version service worker cache names.
- [ ] Delete old caches on activate.
- [ ] Do not cache authenticated API responses unless explicitly safe.
- [ ] Use network-first for live operational data.
- [ ] Use stale-while-revalidate for static assets.
- [ ] Add an “Update available — refresh” banner when a new service worker is waiting.
- [ ] Add offline fallback to `/offline`.
- [ ] Ensure seller and admin service workers do not fight each other.

### 4.7 iOS PWA manual test matrix

Test these exact viewports:

- [ ] iPhone SE width 375
- [ ] iPhone standard width 390/393
- [ ] iPhone Pro Max width 430
- [ ] Tablet width 768
- [ ] Desktop width 1024+

Test these contexts:

- [ ] Safari tab mode
- [ ] Installed PWA mode
- [ ] Light mode
- [ ] Dark mode
- [ ] Poor network
- [ ] Offline
- [ ] Keyboard open
- [ ] Keyboard close
- [ ] Landscape orientation
- [ ] With 0 orders
- [ ] With 1 active order
- [ ] With 50 active/recent orders
- [ ] With 200+ historical orders

---

## 5. Design System and Visual UI Fixes

### 5.1 Replace scattered one-off styling with product primitives

Create reusable primitives that match Porter’s brand.

Suggested files:

- `components/ui/AppShell.tsx`
- `components/ui/AppPage.tsx`
- `components/ui/AppCard.tsx`
- `components/ui/AppButton.tsx`
- `components/ui/AppInput.tsx`
- `components/ui/AppSheet.tsx`
- `components/ui/AppTabs.tsx`
- `components/ui/AppEmptyState.tsx`
- `components/ui/AppBadge.tsx`
- `components/ui/AppToast.tsx`
- `components/ui/AppSkeleton.tsx`
- `components/ui/AppStatCard.tsx`

### 5.2 Typography cleanup

The project uses a strong visual brand, but operational dashboards need extremely readable typography.

**Tasks:**

- [ ] Use display/decorative font only for hero/brand moments.
- [ ] Use a clean system/Inter-style font for dashboard text.
- [ ] Avoid all-caps labels for dense operational UI.
- [ ] Ensure numeric values align cleanly.
- [ ] Use tabular numbers for prices, order IDs, and analytics.
- [ ] Ensure text contrast passes WCAG AA.

### 5.3 Color and contrast

**Tasks:**

- [ ] Audit all dark backgrounds for contrast.
- [ ] Create status tokens:
  - Pending
  - Accepted
  - Preparing
  - Ready
  - Out for delivery
  - Delivered
  - Cancelled
  - Refunded
  - Failed
- [ ] Avoid using red/green alone as the only state indicator.
- [ ] Add icon/text support for critical states.
- [ ] Create light-mode surfaces for seller workflows where readability matters.
- [ ] Ensure dark mode is deliberate, not accidental.

### 5.4 Spacing and density

**Tasks:**

- [ ] Use an 8px spacing scale.
- [ ] Reduce overly wide desktop cards.
- [ ] Avoid cramped mobile cards.
- [ ] Use sticky sections only where helpful.
- [ ] Add consistent page gutters:
  - 16px mobile
  - 20–24px tablet
  - 32px desktop
- [ ] Make drawer and sheet spacing consistent.

### 5.5 Empty states

Every major route needs a good zero state.

Required zero states:

- [ ] No orders yet
- [ ] No active orders
- [ ] No historical orders
- [ ] No inventory items
- [ ] No categories
- [ ] No WhatsApp connection
- [ ] No payment provider
- [ ] No analytics data
- [ ] No customers/chats
- [ ] Push notifications not enabled
- [ ] Store is closed
- [ ] Offline mode

Each empty state should include:

- One-line explanation
- Clear next action
- Optional secondary help link
- No fake data unless demo mode is explicit

---

## 6. App Shell and Navigation Fixes

### 6.1 Reduce mobile bottom nav crowding

Current shell appears to expose many dashboard destinations. On mobile, 7 bottom nav items can become cramped.

**Recommended mobile nav:**

Primary bottom tabs:

1. Orders
2. Chats
3. Inventory
4. Analytics
5. More

Inside More:

- Categories
- Settings
- Billing
- Help
- Admin tools if authorized
- Sign out

**Tasks:**

- [ ] Refactor bottom nav to max 5 items.
- [ ] Add More sheet.
- [ ] Keep desktop sidebar full navigation.
- [ ] Add active route highlighting.
- [ ] Add unread/pending badges.
- [ ] Add safe-area bottom padding.

### 6.2 Topbar improvements

**Tasks:**

- [ ] Keep title concise.
- [ ] Add seller/store switcher if platform supports multiple stores later.
- [ ] Add connection status indicator: WhatsApp connected, OpenWA connected, payment live/test, push enabled.
- [ ] Add “Store open/closed” quick toggle if applicable.
- [ ] Keep notification panel useful, not just decorative.
- [ ] Make notification dropdown full-width sheet on mobile.

### 6.3 Loading and route transitions

**Tasks:**

- [ ] Add page-level skeletons for dashboard routes.
- [ ] Add route loading states that match final layout.
- [ ] Prevent layout jumps when data loads.
- [ ] Add optimistic UI for order status changes.
- [ ] Add rollback toast if mutation fails.

---

## 7. Live Orders Board Redesign

This is Porter’s most important seller workflow.

### 7.1 Core order statuses

Create a clear order lifecycle. Confirm exact names from DB and UI, then standardize.

Suggested operational statuses:

1. New
2. Confirmed
3. Awaiting payment
4. Preparing
5. Packed / Ready
6. Out for delivery
7. Delivered
8. Cancelled
9. Refunded / Failed

**Tasks:**

- [ ] Map DB statuses to user-facing labels.
- [ ] Avoid exposing internal status names.
- [ ] Add status descriptions.
- [ ] Add color/icon tokens.
- [ ] Add allowed transitions.
- [ ] Prevent invalid status moves.

### 7.2 Mobile-first order queue

Kanban is useful on desktop, but mobile needs a focused list.

**Mobile default:** List mode, not horizontal board.

Mobile list sections:

- Needs attention
- Active
- Ready / Dispatch
- Recently completed

Each card should show:

- Order ID
- Customer name
- Customer phone
- Total
- Payment state
- Order age
- Status
- Item count
- Delivery/pickup type
- Main next action
- WhatsApp quick action

**Tasks:**

- [ ] Make list mode default on mobile.
- [ ] Preserve board mode as optional.
- [ ] Add segmented filters.
- [ ] Add urgent order highlighting.
- [ ] Add “oldest first/newest first” toggle.
- [ ] Add search clear button.
- [ ] Add sticky top summary.

### 7.3 Desktop board polish

**Tasks:**

- [ ] Keep DnD on desktop.
- [ ] Add explicit drag handle.
- [ ] Add keyboard-accessible status menu.
- [ ] Add “move to...” action for accessibility.
- [ ] Add column counts and totals.
- [ ] Add collapse empty columns.
- [ ] Add horizontal scroll affordance.
- [ ] Add reduced-motion alternative.

### 7.4 Order detail drawer/sheet

On mobile, order detail should become a full-screen sheet. On desktop, it can be a side drawer.

Sections:

1. Header: order ID, status, age, total
2. Customer: name, phone, WhatsApp, address
3. Items: product, quantity, price, substitutions
4. Payment: method, state, Razorpay link/status
5. Delivery: address, fee, rider, ETA, maps link
6. Timeline: received, confirmed, paid, packed, delivered
7. Notes: internal seller notes
8. Automation: messages sent, failed messages, retry
9. Actions: next status, WhatsApp, cancel, refund, print/share

**Tasks:**

- [ ] Add sticky action bar.
- [ ] Add safe-area bottom padding.
- [ ] Add copy phone/address buttons.
- [ ] Add WhatsApp template quick replies.
- [ ] Add cancel reason flow.
- [ ] Add payment retry flow.
- [ ] Add print/share receipt.
- [ ] Add timeline.

### 7.5 Optimistic update and failure handling

**Tasks:**

- [ ] Use optimistic status changes.
- [ ] Lock card while mutation is in progress.
- [ ] Show spinner on action.
- [ ] Roll back on failure.
- [ ] Show specific error message.
- [ ] Log mutation failures.
- [ ] Prevent double-submit.

---

## 8. Inventory and Catalog Fixes

### 8.1 Product list UX

Mobile product cards should be faster than tables.

Each product card should include:

- Image or placeholder
- Product name
- Category
- Price
- Stock
- Availability toggle
- Low-stock state
- Quick edit
- More menu

**Tasks:**

- [ ] Add mobile card layout.
- [ ] Add desktop table with sticky header.
- [ ] Add search/filter/sort.
- [ ] Add low-stock filter.
- [ ] Add out-of-stock filter.
- [ ] Add category filter.
- [ ] Add bulk select.
- [ ] Add CSV import/export.

### 8.2 Stock management

**Tasks:**

- [ ] Add stock stepper controls.
- [ ] Add stock adjustment reason.
- [ ] Log stock changes.
- [ ] Add low-stock threshold per product.
- [ ] Add bulk low-stock threshold edit.
- [ ] Add “mark unavailable today” action.
- [ ] Prevent orders when stock is unavailable if product is tracked.

### 8.3 Product editor

**Fields:**

- Name
- Description
- Category
- SKU
- Price
- Discount price
- Unit type: piece/kg/litre/pack/etc.
- Stock quantity
- Low-stock threshold
- Image
- Available / hidden
- Tax if applicable
- Substitution rules
- Popular item flag

**Tasks:**

- [ ] Add validation.
- [ ] Add image compression.
- [ ] Add optimistic save.
- [ ] Add dirty-state warning.
- [ ] Add duplicate product action.
- [ ] Add archive instead of hard delete.

### 8.4 Categories page

If missing, implement properly.

**Features:**

- Category list
- Product count per category
- Reorder categories
- Hide/show category
- Edit name/description/icon/color
- Assign products
- Empty category warning

**Tasks:**

- [ ] Add `/dashboard/categories` route.
- [ ] Add category CRUD server actions or API routes.
- [ ] Add optimistic reorder.
- [ ] Add drag handle and non-drag reorder buttons.
- [ ] Add mobile-safe sheet editor.

---

## 9. WhatsApp, Bot, Conversation, and Checkout Reliability

### 9.1 WhatsApp connection status

**Tasks:**

- [ ] Add clear WhatsApp connection card in dashboard home.
- [ ] Show provider: Meta Cloud API, OpenWA, demo/mock.
- [ ] Show last successful inbound message.
- [ ] Show last successful outbound message.
- [ ] Show webhook health.
- [ ] Add test message button.
- [ ] Add troubleshooting checklist.

### 9.2 Conversation handling

**Tasks:**

- [ ] Add unread counts.
- [ ] Add customer profile panel.
- [ ] Link conversations to orders.
- [ ] Add manual takeover mode.
- [ ] Add “bot paused” state.
- [ ] Add canned replies.
- [ ] Add failed-send retry.
- [ ] Add message delivery status if available.
- [ ] Add language support for common Indian languages if roadmap requires it.

### 9.3 Gemini / AI parsing guardrails

**Tasks:**

- [ ] Never let AI directly confirm orders without deterministic validation.
- [ ] Add structured schema validation for AI output.
- [ ] Add fallback if Gemini fails.
- [ ] Add confidence score.
- [ ] If confidence is low, ask clarifying question through WhatsApp.
- [ ] Log AI parse failures without exposing sensitive data.
- [ ] Avoid hallucinated products.
- [ ] Match only seller catalog items.

### 9.4 Payment flow

**Tasks:**

- [ ] Verify Razorpay order creation.
- [ ] Verify payment links.
- [ ] Verify webhook signature.
- [ ] Add payment status timeline.
- [ ] Add retry payment message.
- [ ] Add failed payment handling.
- [ ] Add refund/cancel state model if supported.
- [ ] Add test/live mode indicator.
- [ ] Never expose Razorpay secrets to client.

### 9.5 Abandoned order nudges

The repo has a cron/nudge flow. Make it production-safe.

**Tasks:**

- [ ] Verify cron secret validation.
- [ ] Add rate limits.
- [ ] Add seller-level opt-out.
- [ ] Add customer quiet hours.
- [ ] Add max nudge count per order.
- [ ] Add message templates.
- [ ] Add nudge logs.
- [ ] Add dashboard visibility for nudged orders.

---

## 10. Analytics Improvements

### 10.1 Core seller analytics

Required metrics:

- Revenue
- Orders
- Average order value
- Conversion from conversation to order
- Pending payment count
- Cancelled order count
- Repeat customers
- Top products
- Low-stock products
- Busiest hours
- Delivery vs pickup split
- WhatsApp automation success rate

**Tasks:**

- [ ] Add real empty states.
- [ ] Add date range control.
- [ ] Add compare to previous period.
- [ ] Add loading skeletons.
- [ ] Add export CSV.
- [ ] Add chart fallback if data is too small.
- [ ] Lazy-load heavy chart components.

### 10.2 Mobile analytics UX

**Tasks:**

- [ ] Use compact stat cards.
- [ ] Avoid wide charts requiring horizontal scroll.
- [ ] Use swipeable chart cards only if accessible.
- [ ] Put most important numbers first.
- [ ] Add “what changed?” summaries.

---

## 11. Admin Panel Improvements

### 11.1 Admin overview

Admin should quickly see platform health.

Required cards:

- Active sellers
- New sellers
- Orders today
- GMV today
- Failed webhooks
- Failed WhatsApp sends
- Push failures
- Sellers needing setup help
- Payment connection issues
- Trial/plan distribution

### 11.2 Seller management

**Tasks:**

- [ ] Add seller list filters.
- [ ] Add setup completeness score.
- [ ] Add WhatsApp connection state.
- [ ] Add payment state.
- [ ] Add recent order volume.
- [ ] Add last active time.
- [ ] Add impersonation with audit trail.
- [ ] Add seller notes for support.

### 11.3 Platform events

**Tasks:**

- [ ] Show webhook errors.
- [ ] Show bot parse failures.
- [ ] Show payment failures.
- [ ] Show push failures.
- [ ] Add filters and search.
- [ ] Add retry where safe.
- [ ] Add severity levels.

---

## 12. Auth, Onboarding, and Setup Wizard

### 12.1 Seller onboarding flow

A seller should not land in a complex dashboard without guidance.

Recommended setup checklist:

1. Create store profile
2. Add store hours
3. Add delivery zones
4. Add first category
5. Add first 5 products
6. Connect WhatsApp
7. Connect payment
8. Install PWA
9. Enable notifications
10. Send test order

**Tasks:**

- [ ] Make checklist visible but not annoying.
- [ ] Add progress percent.
- [ ] Add “skip for now” where safe.
- [ ] Add demo data option.
- [ ] Add reset demo data option.
- [ ] Add setup health card.

### 12.2 Auth and session UX

**Tasks:**

- [ ] Improve login form mobile keyboard behavior.
- [ ] Add clear auth error messages.
- [ ] Add resend email/OTP where relevant.
- [ ] Add loading state on submit.
- [ ] Add rate-limit messaging.
- [ ] Add safe redirect handling.
- [ ] Ensure unauthenticated users cannot access seller/admin data.

---

## 13. Marketing Website Improvements

The marketing site should explain Porter in one glance.

### 13.1 Hero section

Hero should communicate:

- Sell through WhatsApp
- Manage orders in one dashboard
- Automate payments and follow-ups
- Built for local sellers/dark stores
- Installable on phone

**Tasks:**

- [ ] Add real product screenshot or interactive demo.
- [ ] Add clear CTA: “Start demo” / “Create store.”
- [ ] Add secondary CTA: “See how it works.”
- [ ] Avoid vague SaaS language.
- [ ] Add seller outcome language.

### 13.2 Trust and feature sections

**Add sections:**

- How it works
- WhatsApp ordering
- Live order board
- Inventory control
- Payments
- Push alerts
- Analytics
- Admin/seller support
- FAQ
- Privacy/security
- Pricing/plans if ready

### 13.3 SEO and sharing

**Tasks:**

- [ ] Add route-specific metadata.
- [ ] Add Open Graph image.
- [ ] Add Twitter card metadata.
- [ ] Add canonical URL.
- [ ] Add structured data if relevant.
- [ ] Add sitemap and robots config if missing.

---

## 14. Accessibility Requirements

### 14.1 Keyboard support

**Tasks:**

- [ ] All buttons reachable by keyboard.
- [ ] Focus rings visible.
- [ ] Drawers trap focus.
- [ ] ESC closes modals/drawers.
- [ ] DnD has keyboard fallback.
- [ ] Dropdowns and menus have correct roles.

### 14.2 Screen reader support

**Tasks:**

- [ ] Icon buttons have `aria-label`.
- [ ] Status chips include text, not color only.
- [ ] Toasts use polite/assertive live regions correctly.
- [ ] Form errors are associated with inputs.
- [ ] Loading states announce when needed.
- [ ] Empty states are readable.

### 14.3 Motion and contrast

**Tasks:**

- [ ] Respect `prefers-reduced-motion`.
- [ ] Avoid flashing effects.
- [ ] Check contrast for all status colors.
- [ ] Do not rely on blur/transparency for readability.

---

## 15. API, Data, and Security Hardening

### 15.1 Request validation

Add shared validation for every API route and server action.

Recommended:

- Zod schemas or equivalent
- Shared error response helper
- Structured logging
- Strict method checks
- Auth checks before DB access
- Seller ownership checks
- Rate limiting for public endpoints

**Tasks:**

- [ ] Create `lib/validation`.
- [ ] Create schemas for seller, product, category, order, payment, webhook.
- [ ] Replace unchecked `request.json()` usage.
- [ ] Add consistent error shape.

### 15.2 Supabase and RLS

**Tasks:**

- [ ] Audit all tables for RLS enabled.
- [ ] Ensure seller users can only access their seller data.
- [ ] Ensure admin users are server-verified.
- [ ] Add DB indexes for common queries.
- [ ] Add unique constraints for external event IDs.
- [ ] Add migration tests or SQL verification docs.

### 15.3 Secrets

**Tasks:**

- [ ] Ensure `.env.example` is complete but contains no real secrets.
- [ ] Ensure secrets are never logged.
- [ ] Ensure credential encryption key is required in production.
- [ ] Ensure Meta/OpenWA/Razorpay/Gemini secrets are server-only.
- [ ] Add startup checks for required env vars.

---

## 16. Performance Improvements

### 16.1 Dashboard performance

**Tasks:**

- [ ] Reduce initial order payload.
- [ ] Lazy-load charts.
- [ ] Lazy-load heavy modals/drawers.
- [ ] Memoize expensive filters.
- [ ] Avoid recalculating fuzzy search on every keystroke without debounce.
- [ ] Add virtualization for long lists if needed.
- [ ] Optimize image loading for product images.

### 16.2 Network behavior

**Tasks:**

- [ ] Use pagination.
- [ ] Use server filtering.
- [ ] Avoid fetching full nested rows where summary data is enough.
- [ ] Add stale/revalidate strategy if using SWR/TanStack Query.
- [ ] Handle slow network visibly.

### 16.3 Bundle size

**Tasks:**

- [ ] Analyze bundle.
- [ ] Lazy-load Recharts.
- [ ] Lazy-load DnD only on board view where possible.
- [ ] Avoid importing admin-only code into seller client bundle.
- [ ] Avoid importing server-only integrations into client components.

---

## 17. Testing Plan

### 17.1 Unit tests

Add tests for:

- [ ] Order status transition rules
- [ ] Price/total calculations
- [ ] Payment state mapping
- [ ] WhatsApp message parsing helpers
- [ ] Category/product validators
- [ ] Plan gating helpers
- [ ] Date/time formatting
- [ ] Notification subscription helpers where possible

### 17.2 Integration tests

Add tests for:

- [ ] Create product
- [ ] Update stock
- [ ] Create category
- [ ] Create order
- [ ] Move order status
- [ ] Mark payment success/failure
- [ ] Webhook duplicate handling
- [ ] Abandoned order nudge logic

### 17.3 E2E route smoke tests

Playwright should visit:

- [ ] `/`
- [ ] `/auth/login` or equivalent auth route
- [ ] `/onboarding`
- [ ] `/dashboard`
- [ ] `/dashboard/orders`
- [ ] `/dashboard/conversations`
- [ ] `/dashboard/analytics`
- [ ] `/dashboard/inventory`
- [ ] `/dashboard/categories`
- [ ] `/dashboard/settings`
- [ ] `/admin`
- [ ] `/offline`
- [ ] `/privacy`
- [ ] `/terms`
- [ ] `/track/test-slug` with mocked/fallback state

### 17.4 Mobile E2E tests

Use Playwright device emulation:

- [ ] iPhone SE
- [ ] iPhone 12/13/14 style viewport
- [ ] iPhone Pro Max

Check:

- [ ] No horizontal overflow.
- [ ] Bottom nav visible.
- [ ] Primary action not hidden.
- [ ] Form inputs do not zoom unexpectedly.
- [ ] Drawer opens/closes.
- [ ] Order status action works.

### 17.5 Accessibility tests

Add:

- [ ] `@axe-core/playwright`
- [ ] Automated checks for key routes
- [ ] Manual screen reader spot check
- [ ] Keyboard-only smoke test

---

## 18. Suggested Phase-by-Phase Implementation Plan

## Phase 0 — Baseline and safety setup

**Goal:** Establish current truth and prevent blind edits.

Tasks:

- [ ] Install dependencies.
- [ ] Run current lint/build.
- [ ] Record current failures in `docs/AGENT_PROGRESS.md`.
- [ ] Create route map.
- [ ] Create component map for dashboard.
- [ ] Mark stale docs as historical.
- [ ] Add this plan to `docs/PORTER_FIX_PLAN.md`.
- [ ] Add `docs/AGENT_PROGRESS.md`.
- [ ] Add `npm run typecheck`.
- [ ] Add `npm run verify`.

Deliverables:

- [ ] Progress doc
- [ ] Updated docs
- [ ] Validation script baseline

---

## Phase 1 — Fix broken routes and obvious blockers

**Goal:** Remove immediate navigation and reliability issues.

Tasks:

- [ ] Verify/fix `/dashboard/categories`.
- [ ] Verify all dashboard nav links.
- [ ] Verify admin nav links.
- [ ] Verify marketing links.
- [ ] Add missing loading/error pages.
- [ ] Fix any TypeScript errors introduced by validation scripts.
- [ ] Add route smoke test skeleton.

Deliverables:

- [ ] Working route map
- [ ] No known 404 from visible nav
- [ ] Basic route smoke tests

---

## Phase 2 — iOS PWA foundation

**Goal:** Make Porter install and behave properly on iPhone.

Tasks:

- [ ] Audit manifest(s).
- [ ] Audit service worker(s).
- [ ] Add/verify viewport metadata.
- [ ] Add Apple web app metadata.
- [ ] Add safe-area CSS tokens.
- [ ] Fix topbar safe areas.
- [ ] Fix bottom nav safe areas.
- [ ] Fix page bottom padding.
- [ ] Fix input font sizes.
- [ ] Fix keyboard-safe drawers.
- [ ] Add update-available banner.
- [ ] Improve offline fallback.
- [ ] Improve install prompt copy.
- [ ] Improve push prompt copy.

Deliverables:

- [ ] iOS PWA checklist completed
- [ ] Screenshots in `docs/screenshots/pwa/`
- [ ] Lighthouse PWA notes

---

## Phase 3 — Dashboard shell and navigation polish

**Goal:** Make the seller dashboard feel native and organized.

Tasks:

- [ ] Reduce mobile bottom nav to max 5 items.
- [ ] Add More sheet.
- [ ] Improve notification sheet on mobile.
- [ ] Add connection status indicators.
- [ ] Add consistent page headers.
- [ ] Add skeleton loading states.
- [ ] Add AppCard/AppButton/AppSheet primitives.
- [ ] Use consistent spacing and typography.

Deliverables:

- [ ] Clean mobile shell
- [ ] Clean desktop sidebar
- [ ] No overlapping fixed UI

---

## Phase 4 — Live orders board redesign

**Goal:** Make order operations fast, safe, and mobile-first.

Tasks:

- [ ] Split `app/dashboard/ui.tsx` into components.
- [ ] Make mobile list the default on mobile.
- [ ] Add board/list preference persistence.
- [ ] Add order filters.
- [ ] Add urgent/aging indicators.
- [ ] Add detail drawer/sheet.
- [ ] Add status transition rules.
- [ ] Add optimistic mutation rollback.
- [ ] Add WhatsApp quick replies.
- [ ] Add payment retry state.
- [ ] Add cancel/refund reason flow.
- [ ] Add accessible DnD fallback.

Deliverables:

- [ ] Operationally strong orders experience
- [ ] Desktop board retained
- [ ] Mobile workflow improved

---

## Phase 5 — Inventory, categories, and catalog

**Goal:** Make catalog management usable for real stores.

Tasks:

- [ ] Build/fix categories route.
- [ ] Add product mobile cards.
- [ ] Add product desktop table.
- [ ] Add product editor sheet.
- [ ] Add image upload/compression if backend supports it.
- [ ] Add stock stepper.
- [ ] Add stock logs.
- [ ] Add low-stock workflow.
- [ ] Add CSV import/export.
- [ ] Add archive/unarchive.

Deliverables:

- [ ] Complete mobile catalog workflow
- [ ] Category management
- [ ] Low-stock operations

---

## Phase 6 — WhatsApp, bot, payment reliability

**Goal:** Make automation trustworthy.

Tasks:

- [ ] Add WhatsApp health card.
- [ ] Add provider diagnostics.
- [ ] Add test inbound/outbound flow where possible.
- [ ] Add webhook idempotency.
- [ ] Add Razorpay webhook idempotency.
- [ ] Add AI parse schema validation.
- [ ] Add failed message retry.
- [ ] Add bot pause/manual takeover.
- [ ] Add abandoned order nudge safety.

Deliverables:

- [ ] Safer automation
- [ ] Better diagnostics
- [ ] Fewer silent failures

---

## Phase 7 — Analytics and admin

**Goal:** Give sellers and admins useful operational insight.

Tasks:

- [ ] Improve analytics empty states.
- [ ] Add date comparison.
- [ ] Add core metrics.
- [ ] Lazy-load charts.
- [ ] Improve admin overview.
- [ ] Add seller health scoring.
- [ ] Add platform event visibility.
- [ ] Add impersonation audit UI.

Deliverables:

- [ ] Better seller analytics
- [ ] Safer admin operations
- [ ] Useful platform diagnostics

---

## Phase 8 — Accessibility, security, performance, and final polish

**Goal:** Make Porter production-ready.

Tasks:

- [ ] Run axe checks.
- [ ] Fix keyboard support.
- [ ] Fix aria labels.
- [ ] Check contrast.
- [ ] Add reduced-motion support.
- [ ] Audit API route validation.
- [ ] Audit RLS policies.
- [ ] Audit env/secrets.
- [ ] Analyze bundle.
- [ ] Optimize payloads.
- [ ] Add final screenshots.
- [ ] Update README.
- [ ] Update deployment docs.

Deliverables:

- [ ] Production-readiness checklist
- [ ] Final validation report
- [ ] Updated docs

---

## 19. File-Level TODO Map

Use this as a starting point. Verify exact files locally.

### App routes

- [ ] `app/layout.tsx` — metadata, viewport, manifest, theme color, Apple PWA support.
- [ ] `app/globals.css` — safe-area tokens, touch/input defaults, motion preferences.
- [ ] `app/dashboard/layout.tsx` — auth, shell, redirects, impersonation banner, pending counts.
- [ ] `app/dashboard/page.tsx` — reduce over-fetching, active-order query, loading states.
- [ ] `app/dashboard/ui.tsx` — split into components.
- [ ] `app/dashboard/loading.tsx` — improve skeleton.
- [ ] `app/dashboard/orders` — verify history/pagination.
- [ ] `app/dashboard/conversations` — improve chat workflow.
- [ ] `app/dashboard/analytics` — improve metrics and mobile charts.
- [ ] `app/dashboard/inventory` — improve product management.
- [ ] `app/dashboard/categories` — create/fix route.
- [ ] `app/dashboard/settings` — setup, provider diagnostics, push test.
- [ ] `app/admin` — security and admin workflow.
- [ ] `app/offline` — better offline/read-only experience.
- [ ] `app/track/[slug]` — customer tracking polish.

### Components

- [ ] `components/dashboard/ShopDashboardShell.tsx` — mobile nav, More sheet, safe-area.
- [ ] `components/dashboard/TopBar.tsx` — notification sheet, status indicators.
- [ ] `components/dashboard/PushPrompt.tsx` — iOS PWA-aware permission flow.
- [ ] `components/dashboard/PWAInstallBanner.tsx` — install education.
- [ ] `components/dashboard/Sidebar.tsx` — route consistency and active states.
- [ ] Add shared UI primitives under `components/ui`.

### Lib

- [ ] `lib/api-json.ts` — standard error and validation responses.
- [ ] `lib/auth-config.ts` — redirect safety.
- [ ] `lib/auth-redirect.ts` — auth safety.
- [ ] `lib/conversation.ts` — AI/bot safety.
- [ ] `lib/gemini.ts` — schema validation and fallback.
- [ ] `lib/meta-whatsapp.ts` — retries and diagnostics.
- [ ] `lib/razorpay.ts` — webhook validation and idempotency.
- [ ] `lib/order-events.ts` — status timeline and audit.
- [ ] `lib/orders-ui.ts` — status labels and transitions.
- [ ] `lib/plan-gates.ts` — clear plan gating.
- [ ] `lib/product-catalog.ts` — inventory/category helpers.
- [ ] `lib/field-crypto.ts` — credential encryption audit.

### API routes

- [ ] `app/api/health` — include dependency health where safe.
- [ ] `app/api/webhook` — signature, idempotency, logging.
- [ ] `app/api/wa/send` — auth, rate limit, retries.
- [ ] `app/api/push` — subscription validation and plan gating.
- [ ] `app/api/cron/nudge-abandoned` — cron secret, quiet hours, max nudges.
- [ ] `app/api/seller` — seller ownership checks.
- [ ] `app/api/admin` — admin authorization.
- [ ] `app/api/billing/status` — secure payment state.

### Public/PWA

- [ ] `public/manifest.json` — app metadata, icons, scope, display.
- [ ] `public/admin-manifest.json` — admin-specific app metadata if still needed.
- [ ] `public/sw.js` — cache strategy and update flow.
- [ ] `public/admin-sw.js` — scope isolation.
- [ ] `public/icons/*` — icon quality and sizes.
- [ ] `public/widget.js` — security and performance audit.

### Supabase

- [ ] Review all migrations.
- [ ] Add missing indexes.
- [ ] Add external event uniqueness.
- [ ] Add order status timeline if missing.
- [ ] Add stock movement logs if missing.
- [ ] Add admin audit logs if missing.
- [ ] Add RLS verification docs.

---

## 20. Manual QA Script

Run this manually before considering the plan complete.

### Seller happy path

- [ ] Sign up or log in.
- [ ] Complete onboarding.
- [ ] Add store details.
- [ ] Add category.
- [ ] Add product.
- [ ] Connect/mock WhatsApp.
- [ ] Create a test order.
- [ ] Move order through statuses.
- [ ] Send WhatsApp update.
- [ ] Mark payment state.
- [ ] Mark delivered.
- [ ] Verify analytics update.
- [ ] Verify history shows order.

### Mobile PWA path

- [ ] Open in iPhone Safari.
- [ ] Add to Home Screen.
- [ ] Launch installed app.
- [ ] Confirm no browser chrome.
- [ ] Confirm safe top spacing.
- [ ] Confirm bottom nav safe spacing.
- [ ] Enable push if eligible.
- [ ] Test offline.
- [ ] Return online.
- [ ] Confirm data refreshes.

### Admin path

- [ ] Log in as admin.
- [ ] View overview.
- [ ] Search seller.
- [ ] View seller health.
- [ ] Impersonate seller.
- [ ] Confirm impersonation banner appears.
- [ ] Stop impersonation.
- [ ] Confirm audit event exists.

### Failure path

- [ ] Invalid WhatsApp config.
- [ ] Invalid Razorpay config.
- [ ] Gemini unavailable.
- [ ] Push permission denied.
- [ ] Network offline.
- [ ] Duplicate webhook.
- [ ] Mutation failure.
- [ ] Unauthorized dashboard access.

---

## 21. Final Release Checklist

Before merge/deploy:

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run test:e2e` passes.
- [ ] `npm run build` passes.
- [ ] No visible nav link 404s.
- [ ] No horizontal overflow on mobile.
- [ ] No fixed UI overlap.
- [ ] No console errors in critical flows.
- [ ] No server secrets in client bundle.
- [ ] No unauthenticated access to seller/admin data.
- [ ] Webhooks reject invalid signatures.
- [ ] Duplicate webhooks are idempotent.
- [ ] PWA install works.
- [ ] Offline fallback works.
- [ ] Push prompt is accurate.
- [ ] README is updated.
- [ ] `.env.example` is updated.
- [ ] Deployment notes are updated.
- [ ] `docs/AGENT_PROGRESS.md` is complete.

---

## 22. Copy-Paste Agent Prompt

Use this prompt when starting an implementation agent:

```md
You are working on the Porter repo: https://github.com/ruddvz/Porter.

Your mission is to complete `docs/PORTER_FIX_PLAN.md` fully. Do not stop after one task. Work phase by phase until all P0, P1, and practical P2 items are complete, tested, and documented.

Rules:
1. Inspect the existing code before editing.
2. Treat older `IMPROVEMENTS.md` content as historical unless confirmed current.
3. Keep `docs/AGENT_PROGRESS.md` updated after every meaningful change.
4. Run validation after every phase: lint, typecheck, tests, build, and route smoke checks.
5. Prioritize iOS PWA/mobile seller experience.
6. Do not remove working WhatsApp, Supabase, Razorpay, Gemini, push, PWA, admin, or dashboard functionality.
7. Continue automatically to the next unchecked task. Do not ask for “next steps.”
8. Stop only for real blockers: missing external credentials, destructive DB changes needing approval, or security/legal concerns.

Start with Phase 0, then Phase 1, and continue until the release checklist is complete.
```

---

## 23. Priority Summary

### Fix first

1. Categories route/nav mismatch.
2. Stale docs and agent progress tracking.
3. Missing validation scripts.
4. Dashboard over-fetching/performance.
5. PWA metadata/safe-area correctness.
6. Admin impersonation security.
7. Webhook/payment idempotency.
8. Mobile live-order UX.

### Then improve

1. Bottom nav and More sheet.
2. Order detail drawer/sheet.
3. Inventory and category workflows.
4. WhatsApp diagnostics.
5. Analytics quality.
6. Admin platform health.
7. Marketing/SEO.
8. Accessibility and performance.

### Final polish

1. Tests.
2. Docs.
3. Screenshots.
4. Deployment checklist.
5. Production readiness report.

---

## 24. Notes for the Owner

This plan intentionally assumes Porter should become a real seller operations product, not just a demo. The existing repo already has many strong building blocks. The biggest risk is not that nothing exists; the biggest risk is inconsistent polish, stale documentation, route mismatches, mobile/PWA edge cases, and production hardening around webhooks, auth, payments, notifications, and realtime order operations.

The implementation agent should therefore avoid rewriting the whole app. It should preserve the working architecture and systematically harden, polish, split, test, and document it.
