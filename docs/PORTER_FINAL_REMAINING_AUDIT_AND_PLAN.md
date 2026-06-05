# Porter — Post-Agent Rigorous Audit + Remaining Work Master Plan

**Repo:** `https://github.com/ruddvz/Porter`  
**Audit date:** 2026-06-04  
**Purpose:** This file is the second-pass, post-agent hardening plan. It assumes an agent already completed the first Porter fix plan, but the repo must now be checked like a production iOS PWA SaaS before it is trusted.

---

## 0. Read this first — important audit limitation

I attempted to treat the current GitHub state as the post-agent output and verify it directly. The public GitHub repository was accessible through web inspection, but the local container could not clone GitHub because DNS resolution failed:

```bash
git clone --depth 1 https://github.com/ruddvz/Porter.git /mnt/data/Porter
# fatal: unable to access 'https://github.com/ruddvz/Porter.git/': Could not resolve host: github.com
```

Because of that, this audit is based on the current public GitHub file tree and raw file inspection, not a local successful `npm install`, `npm run build`, or browser test pass. The agent must re-run the validation commands below in a real local checkout.

This is not a reason to stop. It means this plan is intentionally written as a rigorous **verification + repair checklist**. The agent must execute every item, prove it with commands/screenshots where applicable, and update progress only after validation passes.

---

## 1. Executive verdict

The previous agent appears to have completed meaningful work. The repo is not a blank starter. It currently includes a real Next.js/Supabase product with:

- Next.js app router structure
- Seller dashboard routes
- Admin routes
- API routes
- Public store routes
- Order dashboard pieces
- PWA manifest/service-worker files
- Push prompt/install prompt components
- Supabase migrations through `018`
- Docs including `docs/AGENT_PROGRESS.md` and `docs/PORTER_FIX_PLAN.md`
- Live board split files under dashboard components
- Dashboard sections such as analytics, categories, conversations, inventory, orders, settings

However, it **cannot be considered done yet** because the current repo has serious completion-proof mismatches:

1. `.github/workflows/verify.yml` calls `npm run verify` and `npm run test:e2e`.
2. `package.json` currently only exposes `dev`, `build`, `start`, and `lint` scripts.
3. `package.json` does not show Playwright/Vitest/testing dev dependencies even though progress docs claim Vitest + Playwright smoke tests were completed.
4. `docs/AGENT_PROGRESS.md` claims final verification passed, but the current package/workflow state would fail CI unless scripts/deps are missing from the inspected branch or not committed.
5. README migration documentation is behind the actual migrations directory: README lists migrations through `014`, while the repo contains migrations `015`, `016`, `017`, and `018`.
6. `.env.example` does not appear to include `PORTER_IMPERSONATION_SECRET`, while the progress doc explicitly says that variable must be set.
7. `next.config.mjs` appears empty, so security headers and production hardening are missing or must be intentionally documented elsewhere.
8. Root `IMPROVEMENTS.md` still reads as a completed roadmap/historical doc and can confuse future agents unless clearly marked as historical or removed from the active source of truth.
9. Some claimed work requires manual proof that cannot be trusted from docs alone: iPhone installed PWA QA, safe-area screenshots, Meta webhook signature validation, migration application, push notification flows, and full accessibility coverage.

**Bottom line:** The previous agent likely did important implementation work, but the repo is still in a “needs final hardening and proof” state. The next agent must not start redesigning randomly. It must first reconcile repo truth vs claimed progress, fix the validation pipeline, then complete production hardening.

---

## 2. Agent operating contract

Paste this instruction at the top of the next agent run:

```md
You are continuing the Porter post-agent audit. Do not ask the user for next steps. Do not stop after one issue. Treat this file as the active source of truth. First reconcile repo state against claimed completed work, then fix all P0 blockers, then continue through P1 and P2. After every phase, run validation commands and update docs/AGENT_PROGRESS.md with exact files changed, commands run, failures found, and remaining items. Do not mark any item complete unless the code exists, tests/scripts exist, and validation passes.
```

Mandatory behavior:

- Inspect before editing.
- Never assume previous docs are accurate.
- Prefer fixing root causes over silencing errors.
- Keep commits small and phase-based.
- Run validation after each phase.
- If a test cannot run because env is missing, create a documented mock/stub CI mode or clearly separate local-only tests from CI tests.
- Do not delete business logic without replacing it.
- Do not break Supabase RLS assumptions.
- Do not break WhatsApp/Razorpay/Gemini integrations.
- Do not break PWA installability.
- Do not break mobile-first iOS safe-area handling.

---

## 3. Validation commands that must exist and pass

The repo must support these commands from a clean checkout:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run verify
```

Recommended final `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "verify": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

Important: `verify` should not include `test:e2e` unless the CI environment is prepared to boot the app and run browser tests reliably. A separate workflow job can run E2E after build.

Recommended dev dependencies to install:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

Do not blindly paste versions. Install compatible latest stable versions for the current Node/Next/React stack, then commit the lockfile.

---

## 4. Highest priority blockers

### P0.1 — Fix package scripts vs CI workflow mismatch

**Problem:** CI is configured to run scripts that do not exist in the inspected `package.json`.

**Why this matters:** If CI cannot run, nothing else can be trusted. The previous progress doc says validation passed, but the current package/workflow state contradicts that.

**Required work:**

1. Open `package.json`.
2. Add:
   - `typecheck`
   - `test`
   - `test:watch`
   - `test:e2e`
   - `verify`
3. Install missing dev dependencies:
   - `vitest`
   - `jsdom`
   - `@testing-library/react`
   - `@testing-library/jest-dom`
   - `@testing-library/user-event`
   - `@playwright/test`
4. Add `vitest.config.ts`.
5. Add `playwright.config.ts` if missing.
6. Ensure `e2e/routes.spec.ts` imports from `@playwright/test` and works.
7. Ensure `npm run verify` passes locally.
8. Ensure GitHub Actions passes.
9. Update `docs/AGENT_PROGRESS.md` with actual command outputs.

**Acceptance criteria:**

- `npm ci` succeeds from a clean checkout.
- `npm run lint` succeeds.
- `npm run typecheck` succeeds.
- `npm run test` succeeds.
- `npm run build` succeeds.
- `npm run test:e2e` succeeds locally or in CI.
- `.github/workflows/verify.yml` no longer references missing scripts.

---

### P0.2 — Reconcile `docs/AGENT_PROGRESS.md` with actual repo truth

**Problem:** `docs/AGENT_PROGRESS.md` claims multiple completed items, including validation scripts and test suites, but the inspected package metadata does not prove that.

**Required work:**

1. Open `docs/AGENT_PROGRESS.md`.
2. Add a new section titled `Post-agent reconciliation`.
3. For each claimed completed item, add one of:
   - `Verified in code`
   - `Verified by passing command`
   - `Partially implemented`
   - `Not actually present`
   - `Deferred intentionally`
4. Include exact file paths.
5. Include exact commands run.
6. Include exact failures and fixes.
7. Do not rewrite history to make it look clean. Keep it factual.

**Acceptance criteria:**

- Progress doc no longer claims tests passed unless they actually pass.
- Each completed item references a file path or command proof.
- Deferred items are explicit and assigned priority.

---

### P0.3 — Update README migration documentation through 018

**Problem:** README migration list appears to stop at `014`, while the migrations folder contains `015` to `018`.

**Required work:**

Update README migration section to include:

- `015_storefront_openwa_inventory_ledger.sql`
- `016_categories_product_slugs.sql`
- `017_seller_auto_commit_inventory.sql`
- `018_webhook_idempotency.sql`

For each migration, document:

- Purpose
- Tables changed
- Columns/indexes/functions added
- Backfill behavior
- Whether it is idempotent
- Required deployment order
- Manual verification query

Add a note explaining the missing/skipped `002` naming if it exists historically, so future agents do not create a duplicate `002` migration.

**Acceptance criteria:**

- README migration list matches `supabase/migrations` exactly.
- Deployment instructions include migrations through `018`.
- New developer can apply migrations without guessing.

---

### P0.4 — Add missing `PORTER_IMPERSONATION_SECRET` to `.env.example`

**Problem:** Progress docs say owner must set `PORTER_IMPERSONATION_SECRET`, but `.env.example` does not appear to expose it.

**Required work:**

1. Add:

```bash
PORTER_IMPERSONATION_SECRET="replace-with-strong-random-secret"
```

2. Document it near admin/impersonation variables.
3. Explain:
   - Required for admin impersonation signing
   - Must be long/random
   - Must differ per environment
   - Must not be committed with real value
   - Rotation plan invalidates existing impersonation sessions

**Acceptance criteria:**

- `.env.example` includes it.
- README includes it.
- App fails safely when missing in production.
- Admin impersonation route refuses to issue cookies if secret is missing.

---

### P0.5 — Confirm the post-agent branch is actually merged

**Problem:** `docs/AGENT_PROGRESS.md` references a branch name. The inspected default repo state may or may not contain the complete branch output.

**Required work:**

1. Run:

```bash
git branch --all
git log --oneline --decorate -30
git status
```

2. Confirm whether the branch `cursor/porter-fix-plan-ae8e` was merged.
3. If not merged, compare:

```bash
git diff main..cursor/porter-fix-plan-ae8e --stat
git diff main..cursor/porter-fix-plan-ae8e
```

4. Merge or cherry-pick missing commits.
5. Resolve conflicts.
6. Run full verification.

**Acceptance criteria:**

- Default branch contains all intended post-agent work.
- There is no hidden unmerged branch holding test scripts/deps.
- README/progress docs mention the actual final branch/commit.

---

### P0.6 — Make CI deterministic with safe test environment variables

**Problem:** Next build/tests may require env variables for Supabase, Razorpay, WhatsApp, Gemini, push, or admin secrets.

**Required work:**

In GitHub Actions, provide safe dummy values only for variables required at build/test time. Do not use real secrets for public CI unless private repo secrets are needed.

Example workflow env block:

```yaml
env:
  CI: true
  NEXT_PUBLIC_APP_URL: http://localhost:3000
  NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY: dummy-anon-key
  SUPABASE_SERVICE_ROLE_KEY: dummy-service-role-key
  PORTER_CREDENTIAL_SECRET: ci-dummy-credential-secret-at-least-32-chars
  PORTER_IMPERSONATION_SECRET: ci-dummy-impersonation-secret-at-least-32-chars
  PUSH_INTERNAL_SECRET: ci-dummy-push-secret
  CRON_SECRET: ci-dummy-cron-secret
```

Then ensure the app does not attempt real network calls during unit tests.

**Acceptance criteria:**

- CI passes without production secrets.
- Production-only routes fail closed if required secrets are missing.
- Unit tests mock external services.
- E2E tests use seeded/mocked routes or a documented local Supabase test setup.

---

### P0.7 — Production security headers in `next.config.mjs`

**Problem:** `next.config.mjs` appears empty. A production SaaS handling seller/order/customer data needs security headers.

**Required work:**

Implement a careful `next.config.mjs` with:

- `poweredByHeader: false`
- Security headers
- Image remote patterns if external product/store images are used
- Cache controls where appropriate
- No unsafe CSP that breaks WhatsApp/Razorpay/Gemini flows without testing

Recommended starter:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ]
      }
    ];
  }
};

export default nextConfig;
```

Then evaluate CSP separately. Do not add a strict CSP until Razorpay checkout, Supabase, fonts, images, and any WhatsApp embedded flows are tested.

**Acceptance criteria:**

- Security headers visible in deployed response.
- Razorpay checkout still works.
- Public store images still load.
- PWA manifest/icons still load.
- No console CSP errors in dashboard, storefront, admin, checkout.

---

### P0.8 — Root stale docs cleanup

**Problem:** Root `IMPROVEMENTS.md` appears to be historical and says prior roadmap items were complete. That can mislead future agents.

**Required work:**

Choose one:

1. Move old `IMPROVEMENTS.md` content fully into `docs/HISTORICAL_IMPROVEMENTS.md` and replace root file with a short pointer, or
2. Keep root file but add a clear warning at the top:

```md
# Historical file — not the active plan

This file is retained for context only. The active implementation/audit plans are:

- docs/PORTER_FIX_PLAN.md
- docs/AGENT_PROGRESS.md
- docs/PORTER_FINAL_REMAINING_AUDIT_AND_PLAN.md
```

**Acceptance criteria:**

- Future agents can clearly identify active vs historical docs.
- No conflicting “completed” docs at root without warning.

---

## 5. P0 production correctness checklist

### P0.9 — Confirm Supabase migration 018 is applied and safe

**Required work:**

1. Open `supabase/migrations/018_webhook_idempotency.sql`.
2. Confirm it is idempotent.
3. Confirm it creates a durable webhook event/idempotency table or equivalent.
4. Confirm unique constraints prevent duplicate processing.
5. Confirm old webhook flows are compatible.
6. Add verification SQL to docs:

```sql
select *
from information_schema.tables
where table_schema = 'public'
  and table_name ilike '%webhook%';
```

7. Add rollback notes where possible.

**Acceptance criteria:**

- Migration applies cleanly to a fresh database.
- Migration applies cleanly after previous migrations.
- Duplicate webhook event does not create duplicate order/payment effects.

---

### P0.10 — Verify webhook idempotency in code, not only DB

**Required work:**

Audit:

- `app/api/webhook/...`
- `app/api/wa/send/...`
- `app/api/billing/status/...`
- Razorpay webhook handlers
- WhatsApp/Meta webhook handlers
- OpenWA event ingestion if present

For every webhook/event route, verify:

- Method validation
- Signature validation where required
- Timestamp tolerance if applicable
- Idempotency key selection
- Durable record before side effects or safe transactional behavior
- Repeat event returns success without repeated side effects
- Logging/audit trail
- No customer/seller data leak in logs

**Acceptance criteria:**

- Repeat Meta/Razorpay webhook events are safe.
- Failed side effect can be retried safely.
- Event status tracks pending/processed/failed if needed.

---

### P0.11 — Meta webhook `X-Hub-Signature-256` validation

**Problem:** Progress doc deferred this. For production, it should not stay deferred if the app ingests Meta webhooks.

**Required work:**

1. Add env variable:

```bash
META_APP_SECRET=""
```

2. Validate incoming webhook request body against `X-Hub-Signature-256`.
3. Use raw body bytes for signature calculation.
4. Reject invalid signatures with 401/403.
5. Allow local/dev bypass only with explicit `NODE_ENV !== 'production'` guard.
6. Add unit tests:
   - valid signature passes
   - invalid signature fails
   - missing signature fails in production
   - verify-token GET challenge still works

**Acceptance criteria:**

- Production webhook cannot be spoofed without Meta app secret.
- Tests cover the validation function.
- README documents `META_APP_SECRET`.

---

### P0.12 — Razorpay webhook signature verification

**Required work:**

1. Confirm `RAZORPAY_WEBHOOK_SECRET` is used.
2. Confirm signature header is validated using raw body.
3. Confirm payment/order status transitions are idempotent.
4. Confirm invalid signatures are rejected.
5. Confirm missing secret fails closed in production.
6. Add tests.

**Acceptance criteria:**

- Duplicate payment webhook cannot double-mark/double-credit.
- Spoofed payment webhook is rejected.
- App logs enough to debug without exposing secrets.

---

### P0.13 — Admin impersonation hardening

**Required work:**

Audit admin impersonation implementation:

- Cookie signing HMAC
- Secret source
- Cookie flags
- Expiry
- Seller scope
- Admin audit log
- Exit impersonation
- Prevent privilege escalation
- Prevent customer/public route access confusion

Cookie must be:

- `HttpOnly`
- `Secure` in production
- `SameSite=Lax` or stricter if compatible
- path-scoped where possible
- short-lived

Add tests for:

- valid impersonation token
- expired token
- tampered token
- missing secret
- non-admin request
- exit impersonation

**Acceptance criteria:**

- Admin can impersonate seller only through admin-only route.
- Seller cannot mint impersonation cookie.
- Tampered cookie never works.
- Every impersonation action creates audit event.

---

### P0.14 — Auth boundary review

**Required work:**

Audit all route groups:

- `app/dashboard/*`
- `app/admin/*`
- `app/api/seller/*`
- `app/api/admin/*`
- `app/api/internal/*`
- `app/api/public/*`
- `app/store/[slug]/*`
- `app/track/[slug]/*`

For each route/page, classify:

- Public
- Authenticated seller
- Authenticated admin
- Internal cron only
- Webhook only
- Public but rate-limited

Then verify code matches classification.

**Acceptance criteria:**

- Seller data cannot be accessed by another seller.
- Admin routes require admin.
- Internal routes require secret.
- Public routes never expose private seller/customer data.

---

### P0.15 — RLS policy verification

**Required work:**

Create a Supabase RLS audit doc:

```md
docs/RLS_AUDIT.md
```

For every table, include:

- Table name
- Whether RLS enabled
- Select policy
- Insert policy
- Update policy
- Delete policy
- Service role usage
- Public route usage
- Known risk

Minimum tables to audit:

- sellers
- stores
- products
- categories
- orders
- order_items
- customers
- conversations
- messages
- payments
- inventory_ledger
- webhook_events
- push_subscriptions
- admin/platform events
- referral/billing tables if present

**Acceptance criteria:**

- RLS is not guessed; it is documented.
- Seller-scoped access is tested.
- Admin/service role usage is isolated to server routes.

---

## 6. iOS PWA audit — must be physically tested

The product is supposed to be strong as an iPhone PWA. Browser responsive mode is not enough.

### Required devices/viewports

Test these widths:

- 375px iPhone SE
- 390px iPhone standard
- 393px iPhone standard variants
- 430px Pro Max
- 768px iPad/tablet
- 1024px desktop

Test modes:

- Safari browser
- Installed PWA standalone
- Light mode
- Dark mode if supported
- Reduced motion
- Offline/poor network
- Keyboard open
- Push permission denied
- Push permission accepted

---

### P1.1 — Safe-area and bottom nav verification

**Required work:**

Check every mobile dashboard page:

- `/dashboard`
- `/dashboard/orders`
- `/dashboard/inventory`
- `/dashboard/categories`
- `/dashboard/conversations`
- `/dashboard/analytics`
- `/dashboard/settings`
- `/onboarding`
- `/offline`
- `/store/[slug]`
- `/track/[slug]`
- `/admin` if intended mobile

Verify:

- No content hidden behind iPhone home indicator.
- Bottom nav/pill respects `safe-area-inset-bottom`.
- Floating action buttons do not collide with nav.
- Sticky headers do not overlap content.
- Pull-to-refresh does not expose ugly background.
- Scroll bounce background looks intentional.
- Keyboard does not cover primary CTA.

**Acceptance criteria:**

- Screenshots attached to `docs/QA_IOS_PWA.md`.
- Every page has a pass/fail note.
- All failures fixed.

---

### P1.2 — Input zoom prevention

**Required work:**

Verify every input/select/textarea on iOS uses 16px or larger effective font size.

Pages to check:

- Login/auth
- Onboarding
- Store settings
- Product edit
- Category edit
- Inventory update
- Order search/filter
- Customer/order forms
- Public store checkout

**Acceptance criteria:**

- iOS does not zoom when focusing fields.
- Font size is readable.
- Forms remain usable with keyboard open.

---

### P1.3 — Install flow polish

**Required work:**

Audit:

- `PWAInstallBanner`
- `InstallPrompt`
- manifest files
- Apple touch icons
- splash-like startup behavior
- standalone detection

The install experience should explain:

- Safari share button path
- Add to Home Screen
- Why install helps sellers
- Works better for order alerts
- Can be skipped permanently

**Acceptance criteria:**

- Banner does not repeatedly annoy dismissed users.
- Installed PWA hides browser-specific copy.
- Icons are not blurry/cropped.
- App name is correct on iOS home screen.

---

### P1.4 — Service worker update flow

**Required work:**

Verify:

- Service worker registration path
- Update found behavior
- Update banner visibility
- Reload/apply update action
- Old cache cleanup
- Offline page fallback
- Auth routes are not dangerously cached

**Acceptance criteria:**

- New deployment can be detected by installed PWA.
- User gets a clear “Update available” action.
- Offline page appears when appropriate.
- Private dashboard data is not served stale forever.

---

### P1.5 — Push notification UX

**Required work:**

Audit push components and APIs:

- Permission prompt timing
- Permission denied copy
- Subscription saving
- Unsubscribe/resubscribe
- Test notification button
- Push secret enforcement
- iOS standalone requirements
- Fallback for unsupported browsers

**Acceptance criteria:**

- User is not asked for push too early.
- Denied state is handled gracefully.
- Push subscription is seller-scoped.
- Push routes cannot be abused publicly.
- Docs explain iOS limitations.

---

## 7. Seller dashboard UX hardening

### P1.6 — Dashboard homepage clarity

**Required work:**

The seller dashboard home must answer instantly:

- How many active orders need action?
- How many are unpaid/awaiting payment?
- How many are ready/out for delivery?
- Are there low stock items?
- Is WhatsApp connected?
- Is payment setup complete?
- Is the store live?
- What should the seller do next?

Add/verify:

- Action-first cards
- Setup checklist status
- Low stock alert
- Last order timeline
- Store health card
- “Open storefront” button
- “Share store link” button
- “Send WhatsApp test” button

**Acceptance criteria:**

- Empty seller sees onboarding/setup, not dead charts.
- Active seller sees current operational status.
- Mobile layout does not feel cramped.

---

### P1.7 — Live orders board performance

**Required work:**

The live orders board now appears split into components. Verify it performs under realistic data.

Test with:

- 0 orders
- 1 order
- 10 active orders
- 50 active orders
- 200 historical orders
- Long customer names
- Long addresses
- Long product names
- Many cancelled/delivered orders

Check:

- Initial load time
- Realtime updates
- Polling interval
- Duplicate order handling
- Memory leaks
- Supabase channel cleanup
- Drag-and-drop performance
- Mobile list performance
- Search/filter responsiveness

**Acceptance criteria:**

- No duplicate orders after realtime + polling.
- Drag/drop does not break status.
- Mobile list remains smooth.
- Polling stops/cleans up correctly.

---

### P1.8 — Order status transition rules

**Required work:**

Document and enforce allowed transitions:

```md
pending -> awaiting_payment
pending -> confirmed
pending -> cancelled
awaiting_payment -> paid
awaiting_payment -> cancelled
confirmed -> preparing
confirmed -> cancelled
preparing -> out_for_delivery
preparing -> cancelled
paid -> preparing
paid -> out_for_delivery
out_for_delivery -> delivered
out_for_delivery -> cancelled
```

Adjust based on real business flow, then enforce in code.

Add tests for invalid transitions:

- delivered -> pending should fail
- cancelled -> delivered should fail unless admin override
- paid -> awaiting_payment should fail unless payment correction flow exists

**Acceptance criteria:**

- UI prevents invalid transitions.
- API rejects invalid transitions.
- Optimistic UI rolls back on failure.
- Customer/WhatsApp notification only sends after successful transition.

---

### P1.9 — Order detail panel completeness

**Required work:**

Order detail panel should include:

- Customer name
- Phone
- Address
- Delivery notes
- Payment method/status
- Items with quantities
- Subtotal
- Delivery fee
- Discounts if any
- Total
- Status timeline
- Internal notes
- WhatsApp quick actions
- Call action
- Print/share receipt if useful
- Cancel/refund flow if payments exist

**Acceptance criteria:**

- Seller can complete an order without leaving the panel.
- Important info is not hidden on mobile.
- Phone/address actions work on iPhone.

---

### P1.10 — Mobile orders “More” sheet

**Required work:**

Verify mobile order actions use a clean bottom sheet instead of cramped inline buttons.

Actions should include:

- View details
- Mark confirmed
- Mark preparing
- Mark out for delivery
- Mark delivered
- Send WhatsApp update
- Call customer
- Cancel order

**Acceptance criteria:**

- Sheet is thumb-friendly.
- Dangerous actions require confirmation.
- Sheet respects safe area.
- Sheet focus trap/accessibility is correct.

---

## 8. Inventory and product management

### P1.11 — Inventory ledger correctness

**Required work:**

If migration `015` introduced inventory ledger, verify code uses it correctly.

Check:

- Product stock changes create ledger rows.
- Order placement reserves/decrements stock according to business rule.
- Cancellation restores stock if needed.
- Delivered order finalizes stock.
- Manual adjustment records reason.
- Auto-commit behavior from migration `017` is tested.

**Acceptance criteria:**

- Stock never goes negative unless explicitly allowed.
- Ledger explains every stock movement.
- Order cancellation/refund handles stock correctly.

---

### P1.12 — Low stock UX

**Required work:**

Dashboard should highlight low stock in a seller-friendly way:

- Low stock count
- Product list
- Reorder threshold
- Quick adjust stock
- Hide/disable out-of-stock product
- WhatsApp catalog sync status if applicable

**Acceptance criteria:**

- Seller can fix low stock in under 15 seconds on iPhone.
- Out-of-stock behavior is clear on public storefront.

---

### P1.13 — Product/category slug correctness

**Required work:**

Migration `016` suggests category/product slugs were added. Verify:

- Slugs are unique per seller/store.
- Slugs are stable after product rename unless intentionally changed.
- Public URLs work.
- Duplicate slug collisions are handled.
- Non-English/Indian store names work.
- Empty/invalid names fallback safely.

**Acceptance criteria:**

- No duplicate slug runtime crash.
- Storefront pages do not 404 for valid products/categories.
- SEO metadata is reasonable.

---

### P1.14 — Product form validation

**Required work:**

Audit product/category forms:

- Required name
- Price numeric
- Price non-negative
- Stock integer
- Image URL/file rules
- Category required if business requires
- SKU optional
- Visibility toggle
- Out-of-stock toggle
- Sort order
- Save disabled while submitting
- Error copy readable

**Acceptance criteria:**

- Invalid data cannot corrupt catalog.
- Mobile form is easy to use.
- Toasts/errors are clear.

---

### P2.1 — CSV import/export

This was deferred. It is not P0 unless the business needs bulk onboarding immediately, but it is important for Indian stores with many SKUs.

**Required work:**

- Export products CSV
- Import products CSV
- Validate rows before commit
- Show error report
- Support Hindi/Gujarati names if needed
- Support category mapping
- Support stock/price updates

**Acceptance criteria:**

- Seller can bulk import products safely.
- Bad rows do not partially corrupt catalog.

---

## 9. Public storefront and customer flow

### P1.15 — Storefront checkout smoke test

**Required work:**

For `/store/[slug]`, verify:

- Store found
- Store not found
- Store paused/closed
- Product list empty
- Category filtering
- Search
- Add to cart
- Quantity update
- Remove item
- Address entry
- Phone validation
- Payment/pay later choice
- Order success
- Tracking link
- WhatsApp confirmation if configured

**Acceptance criteria:**

- Customer can place an order on iPhone Safari.
- Customer can place an order in installed PWA if public flow is accessible.
- Empty/error states are polished.

---

### P1.16 — Customer cart persistence

**Required work:**

Verify cart behavior:

- Survives refresh
- Seller/store scoped
- Clears after successful order
- Does not mix stores
- Handles price/stock changes after item added
- Handles product removed after item added

**Acceptance criteria:**

- No wrong-store cart bugs.
- Customer sees clear message when item is unavailable.

---

### P1.17 — Tracking page polish

**Required work:**

For `/track/[slug]`, verify:

- Correct order lookup pattern
- Privacy-safe access
- Status timeline
- Payment state
- Delivery info
- Seller contact action
- Not found state
- Cancelled state
- Delivered state

**Acceptance criteria:**

- Tracking link does not leak other customer orders.
- Timeline is understandable.
- Mobile layout is clean.

---

## 10. WhatsApp / OpenWA / Meta integration

### P1.18 — WhatsApp connection state UX

**Required work:**

Seller must always understand WhatsApp status:

- Not connected
- Connected
- Token expired
- Phone ID missing
- Webhook not verified
- OpenWA disconnected
- Meta API error
- Rate limited
- Test message sent
- Test message failed

**Acceptance criteria:**

- Dashboard does not show fake “connected” state.
- Errors explain what to do next.
- Test send button works or fails clearly.

---

### P1.19 — WhatsApp message templates

**Required work:**

Centralize message templates for:

- Order received
- Awaiting payment
- Payment received
- Order confirmed
- Preparing
- Out for delivery
- Delivered
- Cancelled
- Store closed response
- Product unavailable
- Human support handoff

Support:

- Store name
- Order number
- Customer name
- Total
- Tracking link
- Payment link
- Seller contact

**Acceptance criteria:**

- Templates are not duplicated across files.
- Messages are short and WhatsApp-friendly.
- No broken variables appear in production.

---

### P1.20 — Bot conversation state

**Required work:**

Audit conversation files:

- State persistence
- Reset command
- Language/locale behavior
- Product search/fuzzy matching
- Cart editing
- Address collection
- Payment choice
- Order confirmation
- Human fallback
- Error handling

**Acceptance criteria:**

- Bot does not get stuck in dead states.
- Seller can see conversation context.
- Customer can restart order flow.

---

## 11. Payments and billing

### P1.21 — Razorpay order/payment flow

**Required work:**

Verify:

- Order amount calculation
- Currency INR
- Paise conversion
- Razorpay order creation
- Payment status mapping
- Webhook confirmation
- Failed payment handling
- Cancelled checkout handling
- Duplicate payment webhook safety
- Receipt/customer contact fields

**Acceptance criteria:**

- Payment cannot mark wrong order as paid.
- Amount cannot be tampered client-side.
- Failure state is clear.

---

### P1.22 — Seller subscription/billing status

If the app uses billing plans or gates:

**Required work:**

Audit:

- `plan-gates`
- Billing status API
- Admin override
- Expired plan behavior
- Trial behavior
- Feature gating
- Payment required state

**Acceptance criteria:**

- Seller sees clear plan state.
- Disabled features fail gracefully.
- Public store behavior for unpaid sellers is intentional.

---

## 12. Admin console hardening

### P1.23 — Admin overview truthfulness

**Required work:**

Admin metrics must be accurate:

- Total sellers
- Active sellers
- Stores live
- Orders today
- GMV
- Failed webhooks
- Payment failures
- Push subscriptions
- WhatsApp connected stores
- Low stock stores

**Acceptance criteria:**

- Metrics query real data.
- Empty state is clean.
- Loading/error states exist.

---

### P1.24 — Admin seller management

**Required work:**

Admin should be able to:

- Search sellers
- View seller details
- View store status
- View WhatsApp status
- View order counts
- Impersonate safely
- Suspend/activate store if supported
- See audit events

**Acceptance criteria:**

- Admin actions are permission-protected.
- Dangerous actions confirm.
- Impersonation is auditable.

---

### P1.25 — Admin platform events

**Required work:**

Platform events should capture:

- Seller created
- Store created
- WhatsApp connected/disconnected
- Payment webhook failed
- Admin impersonation started/ended
- Migration/backfill if app-triggered
- Push subscription created/deleted
- Cron failures

**Acceptance criteria:**

- Events are useful for debugging.
- No secrets/customer PII unnecessarily logged.

---

## 13. Accessibility

### P1.26 — Keyboard navigation

**Required work:**

Test keyboard-only on:

- Login
- Dashboard home
- Orders board/list
- Order detail panel
- Product forms
- Category forms
- Settings
- Admin seller list
- Public store cart/checkout

**Acceptance criteria:**

- Focus is visible.
- Tab order is logical.
- Modals trap focus.
- Escape closes sheets/modals.
- Buttons have accessible labels.

---

### P1.27 — Screen reader labels

**Required work:**

Add labels for:

- Icon-only buttons
- Status chips
- Drag handles
- Search fields
- Filters
- Toasts
- Bottom navigation
- Sheet close buttons
- Quantity steppers

**Acceptance criteria:**

- VoiceOver can complete key flows.
- Icon buttons are not announced as “button” only.

---

### P1.28 — Color contrast

**Required work:**

Audit:

- Muted text
- Status chips
- Buttons
- Disabled states
- Dark backgrounds
- Charts
- Form errors
- Placeholder text

**Acceptance criteria:**

- WCAG AA for normal text where practical.
- Critical statuses are not color-only.

---

### P2.2 — Full axe suite

Progress docs deferred this. Add automated accessibility checks.

**Required work:**

- Install `@axe-core/playwright`
- Add Playwright accessibility smoke tests
- Cover main routes
- Do not block on known false positives without documenting them

**Acceptance criteria:**

- E2E accessibility check runs in CI or documented separate workflow.

---

## 14. Performance

### P1.29 — Bundle and route performance

**Required work:**

Run:

```bash
npm run build
```

Review Next route output:

- Largest routes
- Shared JS
- Dashboard client bundle
- Orders board JS
- Recharts impact
- DnD kit impact
- Icons impact

**Optimization ideas:**

- Dynamic import charts.
- Dynamic import DnD-heavy board on desktop only if mobile list does not need it.
- Avoid loading admin code in seller dashboard.
- Avoid loading seller dashboard code on public store.
- Keep public storefront lean.

**Acceptance criteria:**

- Public store route is not bloated by admin/dashboard code.
- Dashboard is responsive on iPhone.
- Heavy components are split where useful.

---

### P1.30 — Font loading

**Problem:** Global CSS appears to import Google Fonts via `@import`. That is slower and less controllable than `next/font` or self-hosted fonts.

**Required work:**

1. Remove remote CSS `@import` font loading from `globals.css` if possible.
2. Use `next/font/google` or self-host fonts consistently.
3. Avoid multiple duplicated font imports between root layout and dashboard layout unless intentional.
4. Define one product font stack.
5. Ensure font fallback does not cause layout shift.

**Acceptance criteria:**

- No CSS `@import` for fonts in production global CSS.
- Font loading is controlled by Next.
- No large layout shift.

---

### P1.31 — Image optimization

**Required work:**

Audit:

- Product images
- Store logos
- App icons
- OG images
- Marketing images

Ensure:

- `next/image` used where appropriate
- Remote image patterns configured
- Fallback image exists
- Lazy loading for product grids
- Correct aspect ratios
- No layout shift

**Acceptance criteria:**

- Product grid does not jump while images load.
- Broken images show clean fallback.
- Public store remains fast.

---

## 15. Error handling and empty states

### P1.32 — Standard empty states

**Required work:**

Create consistent empty states for:

- No orders
- No products
- No categories
- No conversations
- No analytics data
- No low stock items
- No push subscriptions
- No admin sellers
- Store not found
- Store closed
- Offline

Each should include:

- Clear title
- Helpful one-line explanation
- Primary next action
- Optional secondary action

**Acceptance criteria:**

- Empty dashboard never feels broken.
- Seller always knows next step.

---

### P1.33 — Error states

**Required work:**

Standardize error UI:

- API failure
- Network offline
- Permission denied
- Missing env setup
- Supabase error
- Razorpay error
- WhatsApp error
- Push error
- Validation error

**Acceptance criteria:**

- Errors do not show raw stack traces to users.
- Developers can still debug via logs/events.

---

### P1.34 — Toast system discipline

**Required work:**

Audit toasts:

- Success toast after save
- Error toast after failure
- Undo/rollback for optimistic updates where useful
- No duplicate spam toasts
- Toasts accessible to screen readers

**Acceptance criteria:**

- Toasts are helpful, not noisy.
- Critical failures also show inline error where needed.

---

## 16. Design system cleanup

### P1.35 — One design language

**Required work:**

Porter should feel like a focused mobile-first commerce operations tool, not mixed random components.

Audit:

- Card radius
- Border color
- Shadow style
- Button sizes
- Input styling
- Status chips
- Bottom nav
- Header spacing
- Sheet/modal style
- Icon stroke width
- Typography scale

**Acceptance criteria:**

- Dashboard, admin, storefront, onboarding share a coherent system.
- Components are reused instead of copied.

---

### P1.36 — iOS PWA shell

**Required work:**

Verify `ShopDashboardShell`:

- Header is compact
- Store identity visible
- Current section clear
- Bottom nav thumb-friendly
- More sheet works
- Safe-area padding correct
- Desktop layout not harmed

**Acceptance criteria:**

- Installed PWA feels native enough for daily seller use.
- Main actions are reachable with one thumb.

---

### P1.37 — Status chip system

**Required work:**

Create one source of truth for status labels/colors/icons:

- pending
- awaiting_payment
- confirmed
- preparing
- paid
- out_for_delivery
- delivered
- cancelled
- failed

Use same labels everywhere:

- Orders board
- Order card
- Detail panel
- Tracking page
- WhatsApp templates
- Analytics
- Admin

**Acceptance criteria:**

- No mismatched labels like “paid” vs “payment done” unless intentional.
- Color meaning is consistent.

---

## 17. Observability and operations

### P1.38 — Health check route

**Required work:**

Audit `/api/health`:

It should report:

- App alive
- Build/version if available
- Supabase reachable if safe
- Required env presence without exposing values
- Cron/webhook readiness if needed

**Acceptance criteria:**

- Health route useful for deployment checks.
- Does not leak secrets.

---

### P1.39 — Structured logging

**Required work:**

Add consistent server logging helpers for:

- webhook received
- webhook rejected
- order status changed
- payment status changed
- WhatsApp send failed
- push send failed
- cron started/completed/failed
- admin impersonation started/ended

**Acceptance criteria:**

- Production issues can be debugged.
- Logs do not include secrets.
- PII is minimized.

---

### P1.40 — Cron job hardening

**Required work:**

Audit:

- `app/api/cron/nudge-abandoned`
- Any Vercel cron config
- `CRON_SECRET` validation
- Idempotency
- Rate limits
- Logging
- Failure recovery

**Acceptance criteria:**

- Cron cannot be triggered publicly without secret.
- Repeat cron runs are safe.
- Failed run is visible.

---

## 18. Tests to add

### Unit tests

Add tests for:

- Order status transition rules
- Price/total calculation
- Cart calculations
- Slug generation
- WhatsApp template rendering
- Meta signature validation
- Razorpay signature validation
- Impersonation token sign/verify
- Inventory ledger adjustment helpers
- Plan gate helpers
- Setup checklist helpers
- Working hours helpers
- API JSON response helpers

### Integration tests

Add tests for:

- Create order API
- Update order status API
- Public store lookup API
- Push subscription API
- Admin impersonation route
- Cron secret route
- Webhook idempotency insert/replay

### E2E tests

Add Playwright smoke tests for:

- Public home/marketing route loads
- Login route loads
- Dashboard redirects when unauthenticated
- Storefront route handles not-found store
- Offline page loads
- Terms/privacy load
- Admin route redirects when unauthenticated

If seeded auth is available, add:

- Seller dashboard loads
- Orders page loads
- Inventory page loads
- Categories page loads
- Settings page loads
- Create/edit product flow
- Change order status flow

---

## 19. Documentation that must be fixed or created

### Required docs

- `README.md` updated to current state
- `.env.example` updated
- `docs/AGENT_PROGRESS.md` reconciled
- `docs/QA_IOS_PWA.md` created
- `docs/RLS_AUDIT.md` created
- `docs/SECURITY_REVIEW.md` created
- `docs/WEBHOOKS.md` created or updated
- `docs/PWA_QA.md` created or updated
- `docs/DEPLOYMENT_CHECKLIST.md` created or updated
- `docs/HISTORICAL_IMPROVEMENTS.md` clearly historical

### README must include

- What Porter is
- Current architecture
- Setup steps
- Env variables
- Supabase migration order
- Local development
- Testing commands
- CI commands
- Deployment checklist
- PWA notes
- Webhook setup
- Cron setup
- Common failure modes

---

## 20. Exact final agent checklist

The next agent should execute in this order:

### Phase A — Truth reconciliation

- [ ] Clone repo.
- [ ] Check branch/log status.
- [ ] Confirm post-agent branch merged.
- [ ] Run `npm ci`.
- [ ] Run existing scripts.
- [ ] Capture current failures.
- [ ] Compare `docs/AGENT_PROGRESS.md` against actual files.
- [ ] Update progress doc honestly.

### Phase B — Validation infrastructure

- [ ] Fix `package.json` scripts.
- [ ] Install missing test/dev dependencies.
- [ ] Add `vitest.config.ts`.
- [ ] Add `playwright.config.ts`.
- [ ] Fix GitHub Actions.
- [ ] Add minimal tests.
- [ ] Pass `npm run verify`.
- [ ] Pass `npm run test:e2e`.

### Phase C — Docs/env drift

- [ ] Update README migration list through 018.
- [ ] Add missing env variables.
- [ ] Document impersonation secret.
- [ ] Document Meta app secret if signature validation added.
- [ ] Mark stale docs historical.
- [ ] Add deployment checklist.

### Phase D — Security blockers

- [ ] Add security headers.
- [ ] Harden Meta webhook signature validation.
- [ ] Verify Razorpay webhook signature validation.
- [ ] Harden admin impersonation.
- [ ] Audit route auth boundaries.
- [ ] Add RLS audit doc.

### Phase E — PWA/iOS QA

- [ ] Test Safari mode.
- [ ] Test installed PWA mode.
- [ ] Test safe areas.
- [ ] Test keyboard forms.
- [ ] Test offline page.
- [ ] Test service worker update.
- [ ] Test push permission states.
- [ ] Add screenshots to docs.

### Phase F — Dashboard/order hardening

- [ ] Stress test orders board.
- [ ] Enforce status transitions.
- [ ] Verify optimistic rollback.
- [ ] Verify realtime cleanup.
- [ ] Improve order detail panel.
- [ ] Improve mobile More sheet.

### Phase G — Inventory/storefront hardening

- [ ] Verify inventory ledger.
- [ ] Verify low-stock flows.
- [ ] Verify category/product slugs.
- [ ] Verify product forms.
- [ ] Verify public storefront checkout.
- [ ] Verify tracking page privacy.

### Phase H — WhatsApp/payments/cron

- [ ] Verify WhatsApp connection states.
- [ ] Centralize message templates.
- [ ] Test bot state recovery.
- [ ] Verify Razorpay amount/status flow.
- [ ] Verify billing gates.
- [ ] Harden cron route.

### Phase I — Accessibility/performance/polish

- [ ] Keyboard test.
- [ ] Screen reader labels.
- [ ] Contrast audit.
- [ ] Axe smoke suite.
- [ ] Build route size review.
- [ ] Font loading cleanup.
- [ ] Image optimization.
- [ ] Standard empty/error states.

### Phase J — Final proof

- [ ] `npm ci` from clean checkout.
- [ ] `npm run lint` pass.
- [ ] `npm run typecheck` pass.
- [ ] `npm run test` pass.
- [ ] `npm run build` pass.
- [ ] `npm run test:e2e` pass.
- [ ] GitHub Actions pass.
- [ ] Deploy preview checked.
- [ ] iPhone Safari checked.
- [ ] Installed PWA checked.
- [ ] README/progress docs updated.
- [ ] Final summary written with commit hashes.

---

## 21. Definition of done

Porter is not done when the UI looks better. Porter is done when:

1. Clean install works.
2. CI works.
3. Build works.
4. Typecheck works.
5. Tests exist and pass.
6. E2E smoke works.
7. README matches code.
8. `.env.example` matches code.
9. Supabase migrations match docs.
10. Webhooks are authenticated and idempotent.
11. Admin impersonation is safe.
12. Seller dashboard is usable on iPhone.
13. Installed PWA is usable on iPhone.
14. Public storefront checkout works.
15. Tracking page is privacy-safe.
16. Orders board handles real data.
17. Inventory ledger is correct.
18. WhatsApp states are honest.
19. Payment states are correct.
20. Empty/error states are polished.
21. Accessibility basics pass.
22. Production security headers exist.
23. Stale docs are marked historical.
24. Final progress doc reflects actual commands and proof.

---

## 22. Suggested final progress doc format

At the end, `docs/AGENT_PROGRESS.md` should include:

```md
## Final verification — YYYY-MM-DD

### Commit
- Branch:
- Commit hash:
- PR:

### Commands
| Command | Result | Notes |
|---|---:|---|
| npm ci | pass/fail | |
| npm run lint | pass/fail | |
| npm run typecheck | pass/fail | |
| npm run test | pass/fail | |
| npm run build | pass/fail | |
| npm run test:e2e | pass/fail | |

### Manual QA
| Area | Device/mode | Result | Screenshot/doc |
|---|---|---:|---|
| Dashboard home | iPhone Safari | pass/fail | |
| Dashboard home | installed PWA | pass/fail | |
| Orders board | iPhone Safari | pass/fail | |
| Public storefront | iPhone Safari | pass/fail | |
| Checkout | iPhone Safari | pass/fail | |
| Offline | installed PWA | pass/fail | |
| Push prompt | installed PWA | pass/fail | |

### Remaining deferred items
Only list items that are intentionally deferred, with reason and owner.
```

---

## 23. Final note to the agent

Do not treat this as a design-only cleanup. Porter is a real commerce operations app. Broken CI, inaccurate docs, unsafe webhook handling, bad PWA behavior, or wrong inventory/payment logic are bigger problems than visual polish. Fix the proof chain first, then polish.

