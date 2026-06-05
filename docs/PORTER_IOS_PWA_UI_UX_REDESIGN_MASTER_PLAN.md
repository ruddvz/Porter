# Porter — iOS PWA UI/UX Redesign Master Plan

**Repo:** <https://github.com/ruddvz/Porter>  
**Date:** 2026-06-04  
**Purpose:** Give an implementation agent a complete, no-excuses plan to redesign Porter’s UI/UX into a premium iOS-first PWA for real sellers, while preserving the existing Next.js/Supabase/WhatsApp/order/inventory functionality.  
**Primary target:** iPhone Safari + installed iOS PWA.  
**Secondary targets:** Android Chrome PWA, tablet, desktop admin/seller use.  
**Product:** WhatsApp-first dark-store/local-store SaaS for sellers. Customers order through WhatsApp or a public store link. Sellers manage live orders, inventory, chats, setup, payments, analytics, storefront, and admin support.

---

## 0. Agent Operating Contract

You are the implementation agent for the Porter repo. Your job is not to make a few color tweaks and stop. Your job is to redesign the entire Porter UI/UX system so the product feels like a polished iOS PWA, while keeping all working backend and product flows intact.

### 0.1 Non-negotiable rules

1. **Do not stop after one task.** Continue through every phase in this file.
2. **Do not ask the owner for “next step.”** Pick the next unchecked task and continue.
3. **Do not remove existing working product functionality.** Preserve seller auth, onboarding, dashboard, inventory, categories, live orders, admin, public storefront, order tracking, WhatsApp, Razorpay, Gemini, Supabase, service workers, manifests, push prompts, and webhooks.
4. **Do not do a cosmetic-only redesign.** UX flow, empty states, hierarchy, mobile touch ergonomics, route structure, accessibility, and PWA behavior must be fixed.
5. **Do not keep the current messy visual split.** Current code uses a dark neon operational theme, while the older visual blueprint defines a warmer cream/green local-retail SaaS theme. Pick one final direction: **premium light iOS retail SaaS**, with optional dark mode later.
6. **Do not leave duplicated UI systems.** Consolidate tokens, components, card styles, buttons, forms, nav, drawers, modals, tables, badges, skeletons, toasts, and empty states.
7. **Use current code, not stale assumptions.** Inspect files before editing. Older docs may be historical.
8. **Use small safe commits.** Finish each phase, run validation, update progress docs, continue.
9. **Work mobile first.** Every route must be designed and QA’d first at 375px, 390px, 393px, and 430px widths.
10. **Make it feel native in installed iOS PWA mode.** Nothing important can hide behind Dynamic Island/notch/status bar/browser bars/home indicator.
11. **Every interactive control must be thumb-friendly.** Minimum touch region: 44×44 points/CSS px, and larger for frequent/destructive actions.
12. **Keep product language seller-simple.** Replace technical wording with store-owner wording wherever possible.
13. **Document proof.** Update `docs/AGENT_PROGRESS.md` after each phase and include screenshots or screenshot paths.
14. **Only stop for true blockers:** missing private credentials, destructive DB migration approval, unavailable live production URL, or a genuine security/legal blocker.

### 0.2 Definition of done

This UI/UX redesign is done only when all of these are true:

- [ ] `docs/PORTER_IOS_PWA_UI_UX_REDESIGN_MASTER_PLAN.md` exists in the repo.
- [ ] `docs/AGENT_PROGRESS.md` is updated with phase status and proof.
- [ ] All app screens use one coherent design system.
- [ ] Current dark/neon-only styling is replaced by a premium light iOS retail SaaS default.
- [ ] Optional dark mode does not block readability or visual consistency.
- [ ] Dashboard shell has safe-area-correct top bar and bottom navigation.
- [ ] Seller onboarding feels guided, friendly, and non-technical.
- [ ] Live orders are usable with 0, 1, 10, 50, and 200+ orders.
- [ ] Inventory is usable one-handed on iPhone.
- [ ] Public storefront feels like a real mobile store, not a plain debug list.
- [ ] Checkout is clear, sticky, safe-area-aware, and recoverable.
- [ ] Admin console is not visually disconnected from seller UI.
- [ ] Empty states explain what to do next.
- [ ] Loading states feel intentional and route-specific.
- [ ] Error states are human-readable and actionable.
- [ ] Forms do not zoom on iOS; inputs stay at 16px or higher.
- [ ] No route has horizontal overflow at 375px.
- [ ] No dense desktop table is shown as-is on mobile.
- [ ] Navigation labels are consistent across sidebar, bottom tabs, page headings, breadcrumbs, and empty states.
- [ ] Manifest, icons, status bar, theme color, splash color, and app install experience match final design direction.
- [ ] Touch targets meet at least 44×44.
- [ ] Safe-area variables are used consistently.
- [ ] PWA install, update, offline, push permission, and notification states are visually polished.
- [ ] Lighthouse and Playwright/axe smoke checks are added or updated.
- [ ] Manual iPhone QA checklist is completed.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run verify` passes.
- [ ] `npm run test:e2e` passes if configured.

---

## 1. Current Repo Evidence and UI Diagnosis

### 1.1 What Porter already is

The current repo is not a simple static site. The README describes Porter as a **WhatsApp-first dark-store SaaS** that turns natural-language chats into confirmed orders, payment links, and a dashboard sellers can run daily. Existing features include seller dashboard, inventory, orders, chats, settings, payments, WhatsApp Cloud API, Gemini parsing, admin console, Supabase/RLS, push/web-push, Vercel cron, and PWA assets.

Important repo areas:

- `app/(marketing)` — marketing site.
- `app/auth` — seller auth.
- `app/onboarding` — seller setup.
- `app/dashboard` — seller operations.
- `app/dashboard/components` — live orders board and related UI.
- `app/dashboard/inventory` — inventory management.
- `app/dashboard/categories` — category management if present.
- `app/dashboard/conversations` — chats.
- `app/dashboard/analytics` — seller analytics.
- `app/dashboard/settings` — seller settings.
- `app/store/[slug]` — public customer storefront.
- `app/track/[slug]` — order tracking.
- `app/admin` — platform admin.
- `components/dashboard` — seller shell, topbar, install/push/update prompts.
- `components/ui` — shared primitives.
- `public/manifest.json`, service workers, icons — PWA layer.
- `docs/porter_visual_blueprint.json` — older premium light retail SaaS blueprint.

### 1.2 Main UI problem

Porter currently has a **product-quality mismatch**:

- The backend/product scope is serious and useful.
- The UI still feels like a rough dark WhatsApp-themed prototype.
- Some screens use raw hard-coded classes instead of shared primitives.
- The public store looks too plain and not trustworthy enough for customers.
- The dashboard is functional but visually dense and operationally heavy on mobile.
- The current dark theme can look cheap, cramped, and tiring for a full-day seller operations app.
- The existing visual blueprint already points toward a better direction: cream background, white surfaces, emerald primary, saffron accent, rounded cards, soft shadows, and Indian local-retail warmth.

### 1.3 Current files that show the mismatch

The agent must inspect these files directly:

- `app/globals.css`
  - Current default background is very dark: `#0a0f0d`.
  - Current foreground is pale green.
  - Uses `Bebas Neue`, `DM Sans`, and `JetBrains Mono` through a CSS `@import`.
  - Contains Plan0 tokens and Porter tokens mixed together.
  - Contains safe-area variables, which should be retained and formalized.

- `tailwind.config.ts`
  - Current theme is dark/neon Porter: `porter.green`, `porter.bg.base`, `porter.bg.surface`, etc.
  - Needs replacement or extension with final light tokens.

- `app/layout.tsx`
  - Has PWA metadata and `viewportFit: "cover"`.
  - Uses `appleWebApp.statusBarStyle: "black-translucent"`.
  - Theme colors are dark.
  - Needs update for light iOS PWA default.

- `components/dashboard/ShopDashboardShell.tsx`
  - Already has top bar, mobile nav, service worker registration, PWA update/install/push prompts, and live pending-order count.
  - Needs visual redesign and better mobile shell hierarchy.

- `components/dashboard/TopBar.tsx`
  - Shows `PORTER`, store name, page title, bell, profile menu.
  - Needs iOS-native hierarchy and fewer cramped controls.

- `app/dashboard/components/LiveOrdersBoard.tsx`
  - Has live board, stats, date range, search, mobile board/list switch, drag-and-drop, detail panel.
  - Needs better mobile layout, urgent order hierarchy, sticky controls, and card design.

- `app/dashboard/inventory/ui.tsx`
  - Has search, sort, edit mode, bulk actions, CSV import/export, DnD sorting, product modal, image upload, bot listing toggles, inventory ledger.
  - Needs decluttered iPhone-first workflows.

- `app/onboarding/ui.tsx`
  - Uses hard-coded dark shell and input classes.
  - Step 2 exposes Meta Phone Number ID and permanent access token too directly.
  - Needs a guided setup wizard with optional advanced configuration.

- `app/store/[slug]/StorefrontClient.tsx`
  - Current UI is essentially a simple product list/cart/checkout flow.
  - It needs to look like a real mobile storefront with sticky cart, categories, product cards, checkout sheet, empty states, and trust cues.

- `public/manifest.json`
  - Uses dashboard as start URL.
  - Dark background/theme color.
  - Multiple sizes point to the same `icon-192.png`, which should be replaced with proper generated sizes.

- `docs/porter_visual_blueprint.json`
  - Defines a stronger visual direction than current code: premium local-retail SaaS, Indian grocery warmth, cream background, emerald green primary, saffron orange accent, white cards, rounded radii, soft shadows.
  - Use this as the base, but refine it for iOS PWA.

---

## 2. Final Product Design Direction

### 2.1 Positioning

Porter should feel like:

> A premium, calm, iPhone-native operating system for local stores that sell through WhatsApp, online links, and phone orders.

It must not feel like:

- A crypto dashboard.
- A hacked WhatsApp clone.
- A dark terminal admin panel.
- A generic ecommerce template.
- A plain database CRUD app.
- A rough MVP with random cards.

### 2.2 Visual personality

Use this visual personality:

- Warm Indian retail SaaS.
- Clean iOS PWA shell.
- Light, airy, trustworthy.
- Operationally fast.
- Premium but not luxury.
- Friendly for kirana/store owners.
- Calm under pressure.
- Clear when the shop is busy.
- More “modern inventory/order command center” than “WhatsApp green everywhere.”

### 2.3 Final visual system name

Use this internal design system name:

**Porter Fresh Ops UI**

This name is internal only. Do not necessarily show it to end users.

### 2.4 Default theme

Default must be **light**.

Rationale:

- Local store dashboards need long-duration readability.
- Public storefronts look more trustworthy in a clean light retail style.
- The existing visual blueprint already points to cream/white/green/orange.
- Dark neon green feels too prototype-like and can reduce perceived trust.

Dark mode can be added later, but it must not block the redesign.

### 2.5 Core experience principles

1. **One glance tells the seller what needs action.**
2. **Every screen has one main action.**
3. **Never show a dense table on iPhone.**
4. **Use cards, sheets, segmented controls, and sticky bars for mobile.**
5. **Do not hide critical actions in More unless they are genuinely secondary.**
6. **Make status visually obvious but not noisy.**
7. **Separate order status from payment status.**
8. **Separate seller workflow from customer storefront workflow.**
9. **Use plain store-owner language.**
10. **Make external integrations feel safe and understandable.**
11. **Design for one-handed use.**
12. **Respect iOS safe areas everywhere.**
13. **Use optimistic UI only with visible rollback/error handling.**
14. **Show progress, not spinners forever.**
15. **Give useful empty states that teach setup.**

---

## 3. Design Tokens — Replace the Current Mixed System

### 3.1 Token goal

Replace the current dark/neon mixed Plan0/Porter token system with one clean semantic system.

Keep backwards-compatible aliases temporarily if needed, but all new UI must use semantic tokens.

### 3.2 Final color palette

Use these tokens as the redesign default:

```css
:root {
  /* Porter Fresh Ops — light default */
  --po-bg: #fff8ec;
  --po-bg-soft: #fffdf7;
  --po-surface: #ffffff;
  --po-surface-raised: #fffaf1;
  --po-surface-green: #f0f9f2;
  --po-surface-orange: #fff1df;

  --po-text: #111827;
  --po-text-soft: #374151;
  --po-muted: #667085;
  --po-muted-2: #98a2b3;

  --po-line: #eadfce;
  --po-line-strong: #dac9af;

  --po-primary: #0f7a3a;
  --po-primary-hover: #0b6930;
  --po-primary-pressed: #07592a;
  --po-primary-soft: #e7f6eb;

  --po-whatsapp: #25d366;
  --po-whatsapp-dark: #128c7e;

  --po-accent: #f26b00;
  --po-accent-hover: #d85f00;
  --po-accent-soft: #fff1df;

  --po-warning: #b77900;
  --po-warning-soft: #fff6d7;

  --po-danger: #d83b32;
  --po-danger-soft: #fdecea;

  --po-info: #2563eb;
  --po-info-soft: #eff6ff;

  --po-success: #15803d;
  --po-success-soft: #e8f7ee;

  --po-focus: #111827;

  --po-shadow-card: 0 12px 30px rgba(15, 122, 58, 0.08);
  --po-shadow-floating: 0 18px 48px rgba(17, 24, 39, 0.12);
  --po-shadow-sheet: 0 -18px 48px rgba(17, 24, 39, 0.14);

  --po-radius-xs: 10px;
  --po-radius-sm: 14px;
  --po-radius-md: 18px;
  --po-radius-lg: 24px;
  --po-radius-xl: 30px;
  --po-radius-pill: 999px;

  --po-space-1: 4px;
  --po-space-2: 8px;
  --po-space-3: 12px;
  --po-space-4: 16px;
  --po-space-5: 20px;
  --po-space-6: 24px;
  --po-space-8: 32px;
  --po-space-10: 40px;

  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);

  --app-topbar-height: 64px;
  --app-bottom-nav-height: 78px;
}
```

### 3.3 Temporary backward aliases

During migration, keep aliases so old components do not break immediately:

```css
:root {
  --background: var(--po-bg);
  --foreground: var(--po-text);

  --bg-base: var(--po-bg);
  --bg-surface: var(--po-surface);
  --bg-elevated: var(--po-surface-raised);
  --border-plan0: var(--po-line);
  --text-primary: var(--po-text);
  --text-secondary: var(--po-muted);
  --accent: var(--po-primary);
}
```

Then migrate code away from old aliases.

### 3.4 Status colors

Use consistent status tokens:

#### Order status

| Internal | Display label | Visual |
|---|---|---|
| `pending` | New | warning soft |
| `confirmed` | Confirmed | info soft |
| `preparing` | Preparing | accent soft |
| `paid` | Paid | success soft if used as status, but prefer payment badge |
| `out_for_delivery` | Out for delivery | info soft |
| `delivered` | Delivered | success soft |
| `cancelled` | Cancelled | danger soft |
| `awaiting_payment` | Awaiting payment | warning soft |

#### Payment status

| Internal | Display label | Visual |
|---|---|---|
| `unpaid` | Unpaid | warning |
| `paid` | Paid | success |
| `cod` | COD | neutral |
| `cod_collected` | COD collected | success |
| `failed` | Failed | danger |
| `refunded` | Refunded | neutral/info |

#### Inventory status

| State | Display | Visual |
|---|---|---|
| stock > threshold | In stock | success |
| 1–threshold | Low stock | warning |
| 0 | Out of stock | danger |
| inactive/listed false | Hidden from bot | neutral |

### 3.5 Typography

Replace Google `@import` in CSS. Use `next/font` or system stack.

Recommended:

```ts
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", sans-serif;
```

Use:

- No `Bebas Neue` for operational UI.
- No decorative display font in seller dashboard.
- Keep mono only for IDs, tokens, logs, webhook diagnostics.

#### Type scale mobile

| Token | Size | Weight | Use |
|---|---:|---:|---|
| Display | 30/36 | 750 | marketing hero only |
| Page title | 24/30 | 750 | dashboard page headers |
| Section title | 18/24 | 700 | card sections |
| Card title | 16/22 | 650 | list cards |
| Body | 15/22 | 400–500 | default text |
| Caption | 13/18 | 500 | helper text |
| Label | 12/16 | 650 | chips/badges |
| Micro | 11/14 | 650 | metadata only |

#### Type scale desktop

| Token | Size | Weight |
|---|---:|---:|
| Page title | 32/40 | 750 |
| Section title | 22/30 | 700 |
| Card title | 17/24 | 650 |
| Body | 15/24 | 400–500 |

### 3.6 Radius

Use iOS-like rounded rectangles, not tiny technical rectangles.

- Small fields: 14px.
- Cards: 20–24px.
- Sheets/modals: 28–32px.
- Pills/chips/buttons: 999px.
- App icon: iOS squircle shape, not a sharp square.

### 3.7 Shadows

Use soft shadows sparingly:

- Cards: `0 12px 30px rgba(15, 122, 58, 0.08)`.
- Floating bars/sheets: `0 18px 48px rgba(17, 24, 39, 0.12)`.
- Avoid neon glows except tiny WhatsApp connection accents.

### 3.8 Motion

- Use subtle spring-like entrance for sheets.
- Avoid heavy card animations on order boards.
- Respect `prefers-reduced-motion`.
- New order can pulse once, then settle.
- Toasts slide from top or bottom depending shell; do not cover primary action.

### 3.9 Icon system

- Use Lucide only, unless there is a strong reason.
- 2px rounded stroke.
- 18px in chips/buttons.
- 20–22px in nav.
- 24px only for major icons.
- Do not mix filled icon sets with line icons.

---

## 4. iOS PWA Shell Requirements

### 4.1 Global viewport/safe-area standard

The app already uses `viewportFit: "cover"`. Keep that, but redesign body/shell so content and controls do not collide with notch/home indicator.

Global CSS must include:

```css
html {
  min-height: 100%;
  background: var(--po-bg);
}

body {
  min-height: 100dvh;
  margin: 0;
  background: var(--po-bg);
  color: var(--po-text);
  overscroll-behavior-y: none;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

.app-safe-shell {
  min-height: 100dvh;
  padding-left: max(16px, var(--safe-left));
  padding-right: max(16px, var(--safe-right));
}

.app-top-safe {
  padding-top: var(--safe-top);
}

.app-bottom-safe {
  padding-bottom: var(--safe-bottom);
}

.app-scroll-area {
  padding-bottom: calc(var(--app-bottom-nav-height) + var(--safe-bottom) + 20px);
  scroll-padding-bottom: calc(var(--app-bottom-nav-height) + var(--safe-bottom) + 20px);
}
```

### 4.2 Top bar standard

Replace current topbar styling with a clean iOS PWA header.

Mobile top bar:

- Height: `calc(58px + safe-area-top)`.
- Sticky top.
- Background: translucent cream/white blur.
- Bottom hairline border.
- Left: store avatar/squircle or menu depending screen.
- Center/left stack: store name + current page label.
- Right: notification bell + profile button.
- Do not show giant `PORTER` word on every dashboard screen.
- Do not show full page title as a big header inside the top bar if it causes crowding.

Suggested mobile topbar layout:

```txt
[Store avatar]  FreshMart
                Live Orders
                         [Bell] [Profile]
```

Desktop top bar:

- Keep sidebar.
- Use page title and compact action cluster.
- Avoid duplicate store name if sidebar already has store context.

### 4.3 Bottom navigation standard

Current bottom nav is close structurally but needs polish.

Mobile bottom tabs:

1. Orders
2. Chats
3. Inventory
4. Analytics
5. More

Design:

- Fixed bottom, safe-area-aware.
- Floating rounded pill/container.
- Width: `calc(100% - 24px)`.
- Left/right: 12px.
- Bottom: `max(10px, safe-area-bottom)`.
- Height: 66–72px plus safe area.
- White/cream surface with border and soft shadow.
- Active tab has subtle green pill background, not just green text.
- Badge for new orders must not overlap icon/text.
- Label minimum 11px; avoid cramped 10px if possible.
- All tab touch areas min 48px high.

### 4.4 More sheet

The More tab must open an iOS sheet:

- Rounded top corners 28–32px.
- Drag handle.
- Full-width row actions.
- Sections:
  - Store setup
  - History
  - Categories
  - Settings
  - Help/support
  - Sign out
- Show active route.
- Include safe-area bottom padding.
- Escape closes sheet.
- Tap overlay closes sheet.

### 4.5 Desktop shell

Desktop shell should use:

- Light sidebar, not black.
- Sidebar width 260–280px.
- Main content max width 1440px.
- Content padding 24–32px.
- Cards in responsive grid.
- Avoid mobile bottom nav on desktop.

### 4.6 Tablet shell

At 768–1024px:

- Sidebar can collapse to icon rail or remain full depending available width.
- Bottom nav can be hidden if sidebar is present.
- Card grids should use 2 columns.
- Drawers can be side drawers, not full bottom sheets.

---

## 5. Global Component System

### 5.1 Create or refactor primitives

Use or update these shared components:

- `components/ui/Button.tsx`
- `components/ui/Card.tsx`
- `components/ui/Input.tsx`
- `components/ui/Badge.tsx`
- `components/ui/Drawer.tsx`
- `components/ui/Modal.tsx`
- `components/ui/ConfirmDialog.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/Skeleton.tsx`
- `components/ui/Toast.tsx`
- `components/ui/Table.tsx`

Add if missing:

- `components/ui/AppShell.tsx`
- `components/ui/AppTopBar.tsx`
- `components/ui/BottomTabBar.tsx`
- `components/ui/PageHeader.tsx`
- `components/ui/SectionHeader.tsx`
- `components/ui/ActionBar.tsx`
- `components/ui/SegmentedControl.tsx`
- `components/ui/FilterChips.tsx`
- `components/ui/SearchField.tsx`
- `components/ui/StatusBadge.tsx`
- `components/ui/PaymentBadge.tsx`
- `components/ui/InventoryBadge.tsx`
- `components/ui/InlineAlert.tsx`
- `components/ui/ProgressSteps.tsx`
- `components/ui/QuickActionTile.tsx`
- `components/ui/DataCard.tsx`
- `components/ui/MobileDataList.tsx`
- `components/ui/StickyBottomAction.tsx`
- `components/ui/SafeAreaSpacer.tsx`

### 5.2 Button redesign

Current button variants are dark/neon. Replace with:

Variants:

- `primary` — green pill.
- `secondary` — white pill with border.
- `soft` — green soft background.
- `ghost` — transparent/soft hover.
- `danger` — red.
- `warning` — amber/orange.
- `whatsapp` — WhatsApp green for messaging-only actions.

Sizes:

- `sm`: min-height 40, only for secondary desktop uses.
- `md`: min-height 44.
- `lg`: min-height 52.
- `icon`: 44×44.
- `tab`: min-height 48.

Rules:

- One primary action per view/card region.
- Destructive actions require confirm sheet/dialog.
- Loading state must keep button width stable.
- Disabled state must show reason nearby if not obvious.

### 5.3 Card redesign

Variants:

- `surface` — default white card.
- `raised` — slightly elevated.
- `soft` — cream/green tint.
- `warning` — warning soft card.
- `danger` — danger soft card.
- `interactive` — touchable card.

Card rules:

- Mobile card padding: 16px.
- Desktop card padding: 20–24px.
- Card radius: 22–24px.
- Border: `1px solid var(--po-line)`.
- Shadow: soft, not heavy.
- Card groups should have consistent 12–16px gaps.

### 5.4 Input redesign

Inputs:

- Min height 48px.
- Font size 16px to prevent iOS zoom.
- Radius 16px.
- Background white.
- Border `var(--po-line)`.
- Focus ring green.
- Labels above, not placeholder-only.
- Helper text below.
- Error text below in red.

Create common field wrapper:

```tsx
<Field label="Store name" required error={error} hint="Customers will see this on your store link.">
  <Input ... />
</Field>
```

### 5.5 Badge redesign

Use badge variants:

- `success`
- `warning`
- `danger`
- `info`
- `neutral`
- `whatsapp`
- `orange`

Badge rules:

- Use sentence case: “Out for delivery,” not `OUT_FOR_DELIVERY`.
- Use compact icon only when useful.
- Do not use neon text on dark backgrounds.
- Payment and order status badges must look different.

### 5.6 Drawers and sheets

Mobile:

- Most edit/detail flows should be bottom sheets.
- Sheet max height 90dvh.
- Header sticky inside sheet.
- Footer sticky inside sheet.
- Use safe-area bottom.

Desktop:

- Use side drawer width 420–520px for detail/editor flows.
- Use modal only for simple confirmations.

### 5.7 Table replacement on mobile

For mobile, tables become cards/lists.

Rules:

- Any table with more than 3 columns must be replaced with stacked mobile cards.
- Card top row: primary item name + status.
- Second row: key details.
- Bottom row: actions.
- Keep desktop tables for admin where useful.

### 5.8 Toasts

Toast behavior:

- Success: short, green, 3 seconds.
- Error: longer, red, actionable if possible.
- Network/retry errors: include retry action if possible.
- Do not cover bottom sticky checkout/order action.
- On mobile, toast should appear below topbar or above bottom nav depending context.

### 5.9 Empty states

Every empty state must include:

- Friendly title.
- One-sentence explanation.
- Primary action.
- Optional secondary action.
- Small icon/illustration.
- No developer jargon.

Examples:

- No orders: “No orders yet” + “Share your store link or test WhatsApp ordering to see orders here.” + actions “Open store,” “Copy link,” “Send test order.”
- No products: “Add your first products” + “Products appear on your store link and WhatsApp bot.” + actions “Add product,” “Import CSV.”
- No chats: “No customer chats yet” + “WhatsApp conversations will appear once connected.” + action “Check WhatsApp setup.”

---

## 6. Navigation and Information Architecture

### 6.1 Seller dashboard final nav

Primary mobile tabs:

1. **Orders** — `/dashboard`
2. **Chats** — `/dashboard/conversations`
3. **Inventory** — `/dashboard/inventory`
4. **Analytics** — `/dashboard/analytics`
5. **More** — sheet

More sheet items:

- Order history — `/dashboard/orders`
- Categories — `/dashboard/categories`
- Storefront — `/store/[seller.store_slug]` open external/new tab if customer view
- Website setup — create if missing: `/dashboard/website`
- WhatsApp setup — settings section or `/dashboard/whatsapp`
- Payments — settings section or `/dashboard/payments`
- Settings — `/dashboard/settings`
- Help/support
- Log out

### 6.2 Seller route naming cleanup

The current `/dashboard` route appears to be live orders and `/dashboard/orders` appears to be history. That is acceptable, but labels must be clear:

- `/dashboard` label: “Live Orders” or “Orders”.
- `/dashboard/orders` label: “Order History”.

Do not call both “Orders” in different places.

### 6.3 Admin nav

Admin should use:

- Overview
- Sellers
- Orders
- Revenue
- Setup health
- Support
- Settings

Admin must not reuse seller bottom nav unless specifically adapted.

### 6.4 Public customer route nav

Public store should not show seller dashboard nav.

Customer storefront mobile structure:

- Store header.
- Search.
- Category chips.
- Product list/grid.
- Sticky cart bar.
- Checkout sheet.
- Order success/track page.

---

## 7. Route-by-Route Redesign Plan

## 7A. Marketing Site — `app/(marketing)`

### Goal

Make Porter look trustworthy enough for local stores to sign up.

### Current likely problem

Marketing may not visually match dashboard/storefront and may still carry old dark styling.

### Required redesign

Mobile first landing page:

1. Top hero:
   - Logo.
   - Headline: “Run WhatsApp orders, inventory, and store links from one dashboard.”
   - Subcopy: “Built for local stores that already sell through WhatsApp.”
   - CTA: “Create seller account.”
   - Secondary: “View demo store.”

2. Product proof cards:
   - WhatsApp orders.
   - Live inventory.
   - Website/store link.
   - Payments and COD.

3. How it works:
   - Add products.
   - Share store link/WhatsApp.
   - Manage orders.

4. Demo phone mockup:
   - Show order card and cart/status.

5. Trust/FAQ:
   - “Does this replace my website?” → No, Porter complements it.
   - “Can customers order without app?” → Yes.
   - “Does it work with COD?” → Yes if seller enables.

### Mobile requirements

- CTA sticky only if not annoying.
- No tiny hero text.
- No giant decorative type.
- Use screenshots/mockups only if real or intentionally marked demo.

### Acceptance

- [ ] Hero fits above fold on 390×844.
- [ ] CTA visible without confusion.
- [ ] Design matches app tokens.
- [ ] Marketing page does not load Google font `@import` through CSS.
- [ ] Lighthouse mobile performance remains reasonable.

---

## 7B. Auth — `app/auth/login`, `app/auth/signup`, forgot password

### Goal

Make auth feel like a premium business app, not a raw Supabase form.

### Problems found

`LoginForm.tsx` is functional but plain. It uses `AuthShell`, `Button`, `Card`, `Input`, and Google OAuth conditionally. It should inherit the new light system and add trust/context.

### Redesign

Mobile login screen:

- Full screen cream background.
- Top mini brand lockup.
- Card with title: “Welcome back.”
- Subcopy: “Sign in to manage orders, stock, and WhatsApp sales.”
- Email field.
- Password field.
- Forgot password link.
- Primary: “Sign in.”
- Google sign-in if enabled.
- Signup link.
- Security reassurance: “Your store data stays private.”

Signup screen:

- “Create your Porter seller account.”
- Explain that store setup takes 2 minutes.
- Keep fields minimal.

Forgot password:

- Explain clearly.
- After submit, show confirmation card.

### Acceptance

- [ ] Inputs are at least 16px.
- [ ] Button targets at least 44×44.
- [ ] Errors are human-readable.
- [ ] OAuth failure is shown in an inline alert, not plain text.
- [ ] No layout jump when loading.

---

## 7C. Onboarding — `app/onboarding`

### Goal

Make setup feel easy for non-technical store owners.

### Current problems

`app/onboarding/ui.tsx` uses raw hard-coded dark classes. Step 2 asks for Meta Phone Number ID and permanent access token, which is too technical and intimidating. Delivery zones are prefilled with local examples, but the flow does not feel polished.

### New onboarding structure

Use a 4-step wizard:

1. Store basics
2. Products starter
3. Ordering setup
4. Launch checklist

#### Step 1 — Store basics

Fields:

- Store name.
- WhatsApp Business number.
- City.
- Store type: Grocery, Dairy, Pharmacy, Fruits/vegetables, Restaurant, Other.

Design:

- Progress stepper at top.
- Store preview card on the side/under fields.
- Explain each field.

#### Step 2 — Products starter

Actions:

- Add first product.
- Import CSV.
- Skip and add later.

Show why products matter:

> “Products appear in your store link and help the WhatsApp bot understand customer messages.”

#### Step 3 — Ordering setup

Fields:

- Fulfillment: Pickup, Delivery, Both.
- Delivery zones.
- Minimum order.
- Delivery fee.
- COD enabled.
- Manual UPI enabled.

Meta/WhatsApp advanced setup:

- Do not force technical Meta token during onboarding.
- Show simple card: “Connect WhatsApp automation.”
- Options:
  - “Connect now” opens advanced sheet.
  - “Set up later” continues.
  - “Use manual order mode” if supported.

Advanced sheet fields:

- Meta Phone Number ID.
- Access token.
- Test connection.
- Clear explanation.
- Security note.

#### Step 4 — Launch checklist

Show checklist:

- Store profile created.
- Products added.
- Delivery/pickup configured.
- Store link ready.
- WhatsApp automation pending/connected.

Actions:

- Open dashboard.
- Copy store link.
- Continue WhatsApp setup.

### Visual requirements

- White card shell.
- Cream page background.
- Large friendly title.
- Step progress visible.
- Bottom sticky continue button on mobile.
- Back button secondary.
- Confetti only after real successful setup, not before.

### Acceptance

- [ ] User can finish with WhatsApp advanced setup skipped.
- [ ] No required technical tokens block dashboard access unless product requires it.
- [ ] Every step has clear primary CTA.
- [ ] iPhone keyboard does not cover the active field/action.
- [ ] Delivery zones field is easier to edit.
- [ ] Step state persists if possible.

---

## 7D. Dashboard Shell — `components/dashboard/ShopDashboardShell.tsx`, `TopBar.tsx`, nav

### Goal

Make installed PWA feel native and calm.

### Current structure to preserve

- Shell wraps seller dashboard.
- Realtime pending order count.
- Service worker registration.
- PWA install/update banners.
- Push prompt.
- Sidebar/nav.
- Mobile bottom nav + More sheet.
- Impersonation banner.

### Required redesign tasks

- [ ] Replace dark shell background with light cream.
- [ ] Replace current topbar visual design.
- [ ] Replace bottom nav visual design.
- [ ] Keep all nav routes working.
- [ ] Ensure safe-area top/bottom is correct.
- [ ] Make impersonation banner visually impossible to miss but not ugly.
- [ ] Move PWA install/update/push prompts into polished cards/banners.
- [ ] Add `main` landmark and skip link visible on focus.
- [ ] Add route-level page headers where needed.

### Mobile topbar details

Topbar content:

- Store avatar/initials.
- Store name.
- Page label.
- Bell.
- Profile/menu.

Do not show:

- Large `PORTER` wordmark inside operational pages.
- Too many controls on one line.
- Full long store name without truncation.

### Notification menu

Redesign bell popover:

- Mobile: bottom sheet or anchored card below topbar.
- Title: “New orders.”
- Empty: “No pending orders.”
- Items show customer, amount, time, status.
- CTA: “View live orders.”

### Profile menu

Rows:

- Store settings.
- Inventory.
- View store link.
- Help.
- Log out.

### Acceptance

- [ ] Topbar does not overlap content.
- [ ] Bottom nav does not cover content.
- [ ] Active tab clear.
- [ ] Badge count readable.
- [ ] Bell/profile menus usable with thumb.
- [ ] Desktop sidebar and mobile bottom nav share same labels.

---

## 7E. Dashboard Home / Live Orders — `app/dashboard`

### Goal

The seller should know what to do in under 10 seconds.

### Current functionality to preserve

`LiveOrdersBoard.tsx` already has:

- Realtime orders.
- Polling refresh fallback.
- Stats for today orders/revenue/paid/pending.
- Search.
- Date range.
- Mobile layout preference board/list.
- Desktop drag-and-drop board.
- Detail panel.
- Setup checklist.
- Low-stock products.

### Current UX problems

- Too much operational complexity appears too early.
- Date range and search can dominate before urgent actions.
- Kanban on mobile can be awkward.
- Status and payment distinctions need stronger visual separation.
- Empty state needs more coaching.
- New order attention state should be polished.

### Redesign information hierarchy

Mobile `/dashboard` order:

1. Urgent strip if any new/pending orders:
   - “3 orders need action.”
   - CTA “Review now.”

2. Today summary compact cards:
   - Orders today.
   - Sales today.
   - Pending now.
   - Low stock.

3. Setup checklist if not complete.

4. Live Orders segment:
   - Segmented filter: New, Preparing, Delivery, Done.
   - Search icon/field collapsed or inline.
   - Filter sheet for date/payment/source.

5. Mobile order list cards.

6. Low stock mini card.

Desktop `/dashboard` order:

1. Page header + actions.
2. KPI cards.
3. Live board columns.
4. Right rail: setup checklist + low stock + recent activity.

### Mobile order card design

Card fields:

- Top row: customer name + amount.
- Status chips: order status + payment status.
- Source badge: WhatsApp / Store link / Manual.
- Time: “12 min ago.”
- Items preview: “3 items · Milk, Bread, Apples.”
- Fulfillment: Pickup/Delivery.
- Primary action based on status:
  - Pending → Accept.
  - Confirmed → Start preparing.
  - Preparing → Mark ready / Out for delivery.
  - Out for delivery → Mark delivered.
- Secondary: View details.
- Quick contact: WhatsApp/call if data exists.

### Order detail sheet

Mobile sheet:

Header:

- Order number.
- Customer.
- Amount.
- Status.

Sections:

- Customer details.
- Items.
- Payment.
- Fulfillment.
- Notes.
- Timeline.
- Internal actions.

Footer:

- Contextual primary button.
- Secondary button.

### Date filters

Move date range into filter sheet on mobile. Keep desktop inline.

### Search

Search should support:

- Customer name.
- Phone last 4 digits.
- Order ID.
- Product name if feasible.

### New order state

- New order card can have a soft highlight for 900–1500ms.
- Do not keep pulsing forever.
- Sound opt-in must be clear.

### Empty states

No orders:

Title: “No live orders yet.”  
Body: “Orders from your store link and WhatsApp will appear here.”  
Actions: “Open store,” “Copy store link,” “Send test order.”

No filtered results:

Title: “No orders match these filters.”  
Action: “Clear filters.”

### Acceptance

- [ ] Live orders usable with one hand at 375px.
- [ ] Seller can accept first order without opening dense board.
- [ ] Board mode still exists but list mode is default on mobile.
- [ ] DnD remains desktop/tablet-first.
- [ ] Date range does not clutter mobile above fold.
- [ ] Search is always accessible.
- [ ] Order detail sheet works at 90dvh.
- [ ] New order state is noticeable but not annoying.

---

## 7F. Order History — `/dashboard/orders`

### Goal

Let sellers find old/completed/cancelled orders quickly.

### Required design

Mobile:

- Page header: “Order history.”
- Search field.
- Filter chips: Today, 7d, 30d, Paid, COD, Cancelled.
- List cards.
- Detail sheet on tap.

Desktop:

- Table/list hybrid.
- Date range picker.
- Export CSV if supported.
- Filters in toolbar.

### Card fields

- Order ID short.
- Customer.
- Date/time.
- Amount.
- Payment status.
- Order status.
- Fulfillment.
- Source.

### Acceptance

- [ ] No horizontal table on mobile.
- [ ] Search/filter works.
- [ ] Detail view reuses order detail sheet.
- [ ] Export action not dominant on mobile.

---

## 7G. Inventory — `/dashboard/inventory`

### Goal

Make inventory fast and non-scary for sellers.

### Current functionality to preserve

Inventory already includes:

- Search.
- Category filter.
- Sort.
- Edit mode.
- Bulk actions.
- CSV import/export.
- Product add/edit modal.
- Product image upload/compression.
- Bot listing toggle.
- DnD custom sort.
- Inventory ledger panel.

### Current UX problems

- Too many controls visible at once.
- Edit mode/bulk actions can feel like a desktop admin table.
- Product cards need clearer stock/listing states.
- The “Listed in bot” toggle needs plain explanation.
- Import/export should be under more/actions on mobile.
- Product modal likely too long for mobile without sections.

### Redesign mobile hierarchy

1. Inventory health cards:
   - Total products.
   - Low stock.
   - Out of stock.
   - Hidden from bot.

2. Search bar.

3. Filter chips:
   - All.
   - Low stock.
   - Out of stock.
   - Hidden.
   - Category chips.

4. Product list cards.

5. Floating/add product button or sticky action.

6. More actions sheet:
   - Import CSV.
   - Export CSV.
   - Reorder products.
   - Bulk edit.
   - View stock movements.

### Product card mobile design

Fields:

- Product image/squircle placeholder.
- Product name.
- Price/unit.
- Category.
- Stock badge.
- Bot/store visibility badge.
- Quick stock +/- or “Adjust.”
- Edit action.

Example layout:

```txt
[Image] Amul Milk 1L            Low stock
        ₹68 / litre             Listed
        Dairy · 3 left
        [Adjust stock] [Edit]
```

### Product editor sheet

Use sections:

1. Basic info
   - Name.
   - Description.
   - Image.
   - Category.
   - Aliases.

2. Price and unit
   - Price.
   - Unit.

3. Stock
   - Current stock.
   - Low stock threshold if schema supports.
   - Active/listed state.

4. Visibility
   - Show on store link.
   - Include in WhatsApp bot.

Footer:

- Cancel.
- Save product.

### Stock adjustment flow

Add a dedicated quick stock sheet:

- Current stock.
- Add stock.
- Reduce stock.
- Set exact stock.
- Reason optional.
- Save.

This is better than forcing full product edit for simple stock changes.

### Bulk actions mobile

Bulk mode should be explicit:

- Tap “Select.”
- Bottom sticky bulk bar appears.
- Actions: Category, Price, Out of stock, Delete.
- Tap Done to exit.

### CSV import UX

Import sheet:

- Explain accepted columns.
- Upload button.
- Show preview/summary after import.
- Show row errors clearly.
- Keep import under More actions on mobile.

### Acceptance

- [ ] Add product in under 45 seconds.
- [ ] Adjust stock in under 15 seconds.
- [ ] A low-stock seller can identify urgent products immediately.
- [ ] Product listing status is understandable.
- [ ] Bulk mode does not accidentally select products while scrolling.
- [ ] CSV import/export remains functional.
- [ ] No hidden destructive delete without confirm.

---

## 7H. Categories — `/dashboard/categories`

### Goal

Help sellers organize storefront and WhatsApp product discovery.

### Required UI

Mobile:

- Page title: “Categories.”
- Explainer: “Categories help customers browse your store and help your team manage products.”
- Category cards with product count.
- Reorder handle.
- Add category sticky/primary button.
- Empty state.

Category card:

- Category name.
- Product count.
- Visibility status.
- Actions: Edit, Reorder, Archive.

Category editor:

- Name.
- Description optional.
- Sort order.
- Visibility.
- Assign products optional.

Acceptance:

- [ ] Route works.
- [ ] No broken nav link.
- [ ] Empty state useful.
- [ ] Category changes reflect in inventory/storefront if supported.

---

## 7I. Chats / Conversations — `/dashboard/conversations`

### Goal

Make WhatsApp conversations useful without becoming a messy inbox.

### Required mobile layout

- Inbox list with customer name/phone.
- Last message preview.
- Order status if linked.
- Unread marker.
- Time.
- Filter chips: All, Unread, Orders, Needs reply.
- Conversation detail sheet/page.

Conversation detail:

- Chat bubbles.
- Customer/order context card.
- Suggested actions:
  - Create order.
  - Send payment link.
  - Mark resolved.
  - Open WhatsApp.

Empty state:

Title: “No customer chats yet.”  
Body: “Once WhatsApp is connected, customer conversations appear here.”  
Action: “Check WhatsApp setup.”

Acceptance:

- [ ] Inbox cards are readable at 375px.
- [ ] Message bubbles do not overflow.
- [ ] WhatsApp connection state is visible.
- [ ] No raw JSON/debug text.

---

## 7J. Analytics — `/dashboard/analytics`

### Goal

Show business health simply, not a complex BI dashboard.

### Required mobile sections

1. Time range segmented control:
   - Today, 7d, 30d.

2. KPI cards:
   - Orders.
   - Sales.
   - Average order.
   - Repeat customers if available.

3. Sales trend chart.

4. Top products.

5. Stock impact:
   - Low stock.
   - Out of stock.

6. Recovery/WhatsApp metrics if available:
   - Nudges sent.
   - Recovered orders.

### Empty state

If no data:

Title: “Analytics will appear after your first orders.”  
Body: “Share your store link or test an order to start tracking sales.”  
Actions: “Open store,” “Copy link.”

### Chart rules

- Charts must be readable on 375px.
- Do not use tiny legends.
- Use one chart per card.
- Prefer simple bars/line.
- Show labels and fallback table/list if chart library fails.

Acceptance:

- [ ] No cramped chart labels.
- [ ] Time range easy to change.
- [ ] Zero data state is polished.
- [ ] Top products list actionable.

---

## 7K. Settings — `/dashboard/settings`

### Goal

Make settings safe and understandable.

### Required settings groups

Use cards/sections:

1. Store profile
   - Store name.
   - Slug.
   - WhatsApp number.
   - City.
   - Logo/photo if supported.

2. Ordering
   - Pickup enabled.
   - Delivery enabled.
   - Delivery zones.
   - Minimum order.
   - Delivery fee.
   - Off-hours message.

3. Payments
   - COD.
   - Manual UPI.
   - Razorpay status.

4. WhatsApp automation
   - Provider.
   - Connection status.
   - Test connection.
   - Advanced credentials.

5. Notifications
   - Push enabled.
   - Sound preference.

6. Team/security if supported.

7. Danger zone
   - Disconnect provider.
   - Delete store/archive.

### Mobile UX

- Use list of setting cards.
- Tap opens editor sheet.
- Do not put huge forms in one long page.
- Advanced technical settings behind “Advanced.”

Acceptance:

- [ ] Seller can update basic store info easily.
- [ ] Dangerous actions require confirmation.
- [ ] Integration errors are explained.
- [ ] Payment/WhatsApp state is clearly visible.

---

## 7L. Public Storefront — `/store/[slug]`

### Goal

Make customers trust the store and place an order quickly from mobile.

### Current problems

`StorefrontClient.tsx` currently renders a simple store title, search, product list, cart list, checkout fields, and order placed state. It is functional but too plain. It does not feel like a real customer-facing storefront.

### Final mobile structure

1. Store header
   - Store logo/avatar.
   - Store name.
   - City/area.
   - Open/closed status if available.
   - Fulfillment info: Pickup/Delivery.

2. Search bar
   - Sticky or near top.
   - Placeholder: “Search milk, rice, snacks...”

3. Category chips
   - All.
   - Dynamic categories.

4. Product cards
   - Image/placeholder.
   - Name.
   - Price/unit.
   - Stock label.
   - Add button or quantity stepper.

5. Sticky cart bar
   - “3 items · ₹240”
   - CTA: “View cart” or “Checkout.”
   - Safe-area-aware.

6. Cart sheet
   - Items.
   - Quantity controls.
   - Subtotal.
   - Delivery fee if applicable.
   - Total.
   - Fulfillment type.
   - CTA: “Continue.”

7. Checkout sheet
   - Name.
   - Phone.
   - Delivery/pickup choice.
   - Address if delivery.
   - Notes optional.
   - Payment method.
   - Place order.

8. Success state
   - Friendly success card.
   - Order number/track link.
   - Store contact.
   - “Continue shopping.”

### Product card rules

- Out-of-stock products cannot be added.
- “Only 3 left” for low stock.
- Button state changes to stepper after add.
- Price aligned clearly.

### Cart persistence

The repo already has cart persistence/reconciliation. Preserve it and improve visual notice:

- “We removed unavailable items from your cart.”
- “Prices updated for these items.”
- Show as dismissible inline alert.

### Empty states

No products:

Title: “No products available yet.”  
Body: “This store is still setting up its catalog.”  
Action: “Message store on WhatsApp” if phone available.

No search results:

Title: “No matches.”  
Body: “Try a different product name.”  
Action: “Clear search.”

### Checkout validation

- Phone field must use `inputMode="tel"`.
- Name required.
- If delivery selected, address required.
- Show inline validation before fetch.
- Disable place order if cart empty.
- Loading state stable.
- Error state with retry.

### Acceptance

- [ ] Customer can order in under 90 seconds.
- [ ] Sticky cart bar does not overlap home indicator.
- [ ] Product cards look trustworthy.
- [ ] Checkout fields do not zoom on iOS.
- [ ] Out-of-stock products cannot be ordered.
- [ ] Success page has clear track action.
- [ ] Public storefront does not show seller dashboard styling/nav.

---

## 7M. Order Tracking — `/track/[slug]`

### Goal

Give customers confidence after placing an order.

### Required design

Mobile tracking screen:

- Store header.
- Order status stepper:
  - Placed.
  - Confirmed.
  - Preparing.
  - Out for delivery / Ready for pickup.
  - Delivered.
- Payment status badge.
- Item summary.
- Total.
- Customer info masked if needed.
- Contact store action.

Empty/error:

- “Order not found.”
- “Check the link or contact the store.”

Acceptance:

- [ ] Track screen is customer-facing polished.
- [ ] Status timeline is clear.
- [ ] No raw IDs unless needed.
- [ ] Works on 375px.

---

## 7N. Admin Console — `app/admin`

### Goal

Make admin usable and visually aligned, but not over-prioritized above seller/customer flows.

### Required design

Admin should be clean, light, enterprise-style:

- Sidebar nav.
- Overview dashboard.
- Seller table/list.
- Seller detail.
- Impersonation action clearly controlled.
- Setup health badges.
- Orders/analytics support views.

Mobile admin:

- If admin used on mobile, cards instead of huge tables.
- Otherwise desktop-first is acceptable after seller/customer mobile is done.

Acceptance:

- [ ] Admin is visually aligned with new tokens.
- [ ] Impersonation warning/banner is obvious.
- [ ] Tables are usable on desktop.
- [ ] Mobile admin has no catastrophic overflow.

---

## 7O. Offline Page — `/offline`

### Goal

Make offline state feel intentional, not broken.

### Required design

- Icon/illustration.
- Title: “You’re offline.”
- Body: “Porter will reconnect when your internet is back.”
- Show what still works if anything.
- Button: “Try again.”
- If dashboard shell can show cached data, explain stale state.

Acceptance:

- [ ] Offline page uses final tokens.
- [ ] Safe-area correct.
- [ ] Retry action works.

---

## 8. PWA Install, Update, Push, and Manifest

### 8.1 Manifest redesign

Current manifest uses dark background/theme colors and repeats `icon-192.png` for multiple sizes. Fix it.

Required manifest:

```json
{
  "name": "Porter — Seller Dashboard",
  "short_name": "Porter",
  "description": "Manage WhatsApp orders, inventory, and your store link.",
  "start_url": "/dashboard",
  "scope": "/",
  "display": "standalone",
  "background_color": "#FFF8EC",
  "theme_color": "#0F7A3A",
  "categories": ["business", "productivity", "shopping"],
  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

Also add:

- `apple-touch-icon.png` 180×180.
- Proper maskable icon with padding.
- Splash background color aligned to light theme.

### 8.2 App status bar

Update `app/layout.tsx`:

- `appleWebApp.statusBarStyle` should be reviewed.
- For light app, test `default` vs `black-translucent` in installed mode.
- Final choice must avoid unreadable status bar icons and content collision.

Recommended starting point:

```ts
appleWebApp: {
  capable: true,
  title: "Porter",
  statusBarStyle: "default",
}
```

Then test physical iPhone. If default creates bad visual bars in standalone mode, use a controlled top safe background.

### 8.3 PWA install banner

Current project has `PWAInstallBanner.tsx` and `InstallPrompt.tsx`. Redesign as:

- Small card on dashboard home until dismissed.
- Copy: “Install Porter on your iPhone for faster order alerts.”
- Actions: “How to install,” “Later.”
- iOS instructions sheet:
  1. Tap Share.
  2. Tap Add to Home Screen.
  3. Open Porter from your Home Screen.
- Do not show Android-specific prompt on iOS.

### 8.4 PWA update banner

Create polished update banner:

- “A new Porter update is ready.”
- Button: “Reload.”
- Secondary: “Later.”
- Do not interrupt active checkout/order status update.

### 8.5 Push prompt

Push permission UX:

- Do not ask immediately on first page load.
- Ask after seller reaches dashboard and understands value.
- Card copy: “Get notified when a new order arrives.”
- CTA: “Enable order alerts.”
- Secondary: “Not now.”
- If denied, show how to enable in settings later.

### 8.6 Offline and stale content

- Show cached dashboard data as stale if available.
- Disable risky actions when offline.
- Queue non-destructive local changes only if implemented safely.
- Never pretend an order status was updated if request failed.

---

## 9. File-Level Implementation Plan

### 9.1 `app/globals.css`

Tasks:

- [ ] Remove Google Fonts `@import`.
- [ ] Add final Porter Fresh Ops tokens.
- [ ] Keep safe-area variables.
- [ ] Replace dark body defaults with light defaults.
- [ ] Add utility classes:
  - `.app-safe-shell`
  - `.app-scroll-area`
  - `.ios-glass`
  - `.touch-target`
  - `.no-scrollbar`
  - `.text-balance` if needed.
- [ ] Keep reduced-motion rules.
- [ ] Remove obsolete Plan0 comments after migration or mark legacy clearly.

### 9.2 `tailwind.config.ts`

Tasks:

- [ ] Add semantic colors under `porter` or replace current palette.
- [ ] Add final radius scale.
- [ ] Add final shadows.
- [ ] Add safe spacing tokens.
- [ ] Do not hard-code old dark palette as default.

Suggested Tailwind mapping:

```ts
porter: {
  bg: {
    base: "var(--po-bg)",
    soft: "var(--po-bg-soft)",
    surface: "var(--po-surface)",
    raised: "var(--po-surface-raised)",
  },
  text: {
    primary: "var(--po-text)",
    secondary: "var(--po-text-soft)",
    muted: "var(--po-muted)",
  },
  line: "var(--po-line)",
  primary: "var(--po-primary)",
  accent: "var(--po-accent)",
  danger: "var(--po-danger)",
  warning: "var(--po-warning)",
  success: "var(--po-success)",
}
```

### 9.3 `app/layout.tsx`

Tasks:

- [ ] Update metadata theme colors.
- [ ] Update apple web app style.
- [ ] Ensure `html lang="en"`.
- [ ] Add body class with final font variables.
- [ ] Preserve ToastProvider and rejection toaster.
- [ ] Ensure skip link is correct.

### 9.4 `components/ui/Button.tsx`

Tasks:

- [ ] Replace variant classes with light tokens.
- [ ] Ensure min height 44px.
- [ ] Add `soft`, `warning`, `whatsapp`, and `icon` support if useful.
- [ ] Preserve loading state.
- [ ] Add `aria-busy` when loading.

### 9.5 `components/ui/Card.tsx`

Tasks:

- [ ] Replace dark classes.
- [ ] Add variants.
- [ ] Ensure interactive cards have focus state.
- [ ] Use correct role/tabIndex only when clickable.

### 9.6 `components/ui/Input.tsx`

Tasks:

- [ ] Ensure 16px font size.
- [ ] Add label/hint/error pattern or create Field wrapper.
- [ ] Light styling.
- [ ] Touch-friendly height.

### 9.7 `components/dashboard/ShopDashboardShell.tsx`

Tasks:

- [ ] Replace shell colors.
- [ ] Redesign bottom nav.
- [ ] Improve More sheet.
- [ ] Ensure app scroll area bottom padding.
- [ ] Use new `AppTopBar`.
- [ ] Do not break service worker/realtime hooks.

### 9.8 `components/dashboard/TopBar.tsx`

Tasks:

- [ ] Redesign as described.
- [ ] Remove giant operational `PORTER` label from dashboard topbar.
- [ ] Improve bell/profile popovers.
- [ ] Convert popovers to sheets on mobile if needed.
- [ ] Add accessible labels.

### 9.9 `app/onboarding/ui.tsx`

Tasks:

- [ ] Replace raw dark classes.
- [ ] Convert to guided wizard.
- [ ] Hide advanced Meta credential fields behind a connection sheet.
- [ ] Add progress stepper.
- [ ] Add sticky mobile action bar.
- [ ] Use shared Field/Input/Button/Card.

### 9.10 `app/store/[slug]/StorefrontClient.tsx`

Tasks:

- [ ] Replace simple list with full storefront UI.
- [ ] Add category chips if product categories available.
- [ ] Add sticky cart bar.
- [ ] Add cart sheet.
- [ ] Add checkout sheet.
- [ ] Add validation.
- [ ] Add success screen.
- [ ] Keep cart persistence/reconciliation logic.

### 9.11 `app/dashboard/components/LiveOrdersBoard.tsx`

Tasks:

- [ ] Reorder mobile hierarchy.
- [ ] Move filters into mobile sheet.
- [ ] Make list mode default on mobile.
- [ ] Redesign order cards.
- [ ] Redesign detail panel/sheet.
- [ ] Keep DnD desktop behavior.
- [ ] Preserve realtime/polling behavior.

### 9.12 `app/dashboard/inventory/ui.tsx`

Tasks:

- [ ] Redesign inventory health summary.
- [ ] Redesign product cards.
- [ ] Move secondary actions to More sheet on mobile.
- [ ] Add quick stock adjustment sheet.
- [ ] Improve product editor sections.
- [ ] Keep bulk actions/CSV/DnD/image upload.

### 9.13 `public/manifest.json` and icons

Tasks:

- [ ] Generate correct icon sizes.
- [ ] Update theme/background color.
- [ ] Add `scope` if missing.
- [ ] Add apple-touch-icon.
- [ ] Test installed app name/icon.

---

## 10. Detailed Mobile Screen Specs

### 10.1 iPhone dashboard home target layout

Viewport: 390×844.

```txt
┌───────────────────────────┐
│ safe area                 │
│ [Avatar] FreshMart   🔔 👤 │
│          Live Orders       │
├───────────────────────────┤
│ 3 orders need action       │
│ [Review now]               │
│                           │
│ Today                      │
│ [Orders 12] [Sales ₹4.2k]  │
│ [Pending 3] [Low stock 6]  │
│                           │
│ Finish setup               │
│ [Checklist card if needed] │
│                           │
│ Live orders      [Filter]  │
│ [New][Prep][Delivery][Done]│
│ [Search field]             │
│                           │
│ [Order card]               │
│ [Order card]               │
│                           │
│ bottom nav safe area       │
└───────────────────────────┘
```

### 10.2 iPhone order card target layout

```txt
┌───────────────────────────┐
│ Priya Patel        ₹420    │
│ New · Unpaid · WhatsApp    │
│ 12 min ago · Delivery      │
│ 4 items · Milk, Rice +2    │
│ [Accept order] [Details]   │
└───────────────────────────┘
```

### 10.3 iPhone inventory card target layout

```txt
┌───────────────────────────┐
│ [img] Amul Milk 1L  Low    │
│       ₹68 / litre          │
│       Dairy · 3 left       │
│       Listed in store & bot│
│ [Adjust stock]      [Edit] │
└───────────────────────────┘
```

### 10.4 iPhone storefront target layout

```txt
┌───────────────────────────┐
│ FreshMart                 │
│ Open · Pickup & delivery  │
│ [Search products]         │
│ [All][Dairy][Snacks]      │
│                           │
│ [Product card]            │
│ [Product card]            │
│                           │
│ [3 items · ₹240] Checkout │
└───────────────────────────┘
```

### 10.5 iPhone checkout sheet target layout

```txt
┌───────────────────────────┐
│ Checkout                  │
│ 3 items · ₹240            │
│ Name                      │
│ Phone                     │
│ Fulfillment [Pickup/Deliv]│
│ Address if delivery       │
│ Payment [COD/Online]      │
│                           │
│ [Place order ₹240]        │
└───────────────────────────┘
```

---

## 11. Copy and Microcopy Standards

### 11.1 Voice

Use:

- Clear.
- Friendly.
- Short.
- Seller-first.
- Non-technical.

Avoid:

- API jargon.
- “Mutation failed.”
- “RLS error.”
- “Webhook payload.”
- “Provider token invalid” without explanation.

### 11.2 Better wording examples

| Bad | Better |
|---|---|
| Meta permanent access token | WhatsApp API token |
| Test endpoint failed | We could not connect to WhatsApp. Check the number ID and token. |
| No rows | No products yet |
| pending | New |
| paid status | Payment |
| order status | Order progress |
| in_stock false | Out of stock |
| is_active false | Hidden from store and bot |
| delivery_zones | Delivery areas |

### 11.3 Button labels

Use action verbs:

- Add product
- Adjust stock
- Accept order
- Start preparing
- Mark delivered
- Copy store link
- Open store
- Enable alerts
- Test WhatsApp
- Save changes

Avoid vague labels:

- Submit
- Continue without context
- OK
- Confirm if action is unclear

---

## 12. Accessibility Requirements

### 12.1 Touch targets

- Minimum interactive hit area: 44×44.
- Prefer 48×48 for frequent operational actions.
- Destructive actions should not be adjacent to primary actions without spacing.

### 12.2 Color contrast

- Text on backgrounds must meet WCAG contrast.
- Do not rely only on color for statuses.
- Use icons/labels with color.
- Recheck all soft badges.

### 12.3 Keyboard and screen reader

- All sheets/dialogs trap focus.
- Escape closes modal/sheet where appropriate.
- Buttons have accessible names.
- Icon-only buttons have `aria-label`.
- Loading states use `aria-busy`.
- Error messages link to fields if feasible.
- Use semantic headings.
- Use `main`, `nav`, `header`, `section` landmarks.

### 12.4 Motion

- Respect `prefers-reduced-motion`.
- Do not require drag-and-drop; always provide alternative reorder controls if possible.

### 12.5 Forms

- Labels must be visible.
- Placeholder is not a label.
- Inputs at least 16px on mobile.
- Validation inline.
- Required fields marked clearly.

---

## 13. Performance Requirements

### 13.1 Fonts

- Remove CSS `@import` font loading.
- Use `next/font` or system fonts.
- Avoid multiple font families.
- Operational dashboard should not need Bebas Neue.

### 13.2 Route load

- Skeletons should match final layout.
- Avoid giant client components where route-level split is possible.
- Keep live board data limited and paginated.
- Avoid fetching huge nested datasets for every page if not needed.

### 13.3 Images

- Product images should use optimized sizes where possible.
- Placeholder image/squircle for missing product images.
- Storefront images should not break layout.

### 13.4 PWA cache

- Avoid stale app shell hiding new deployment forever.
- Update banner should work.
- Offline page should load.

---

## 14. QA Matrix

### 14.1 Device sizes

Test these widths:

- 320px if practical.
- 375×667 — iPhone SE / small.
- 390×844 — standard iPhone.
- 393×852 — modern iPhone.
- 430×932 — Pro Max.
- 768×1024 — tablet.
- 1024×768 — tablet landscape.
- 1280+ — desktop.

### 14.2 Browser/PWA states

- iPhone Safari normal browser.
- iPhone installed PWA.
- Android Chrome normal browser.
- Android installed PWA.
- Desktop Chrome.
- Desktop Safari if available.

### 14.3 Route smoke checklist

- [ ] `/`
- [ ] `/auth/login`
- [ ] `/auth/signup`
- [ ] `/auth/forgot-password`
- [ ] `/onboarding`
- [ ] `/dashboard`
- [ ] `/dashboard/orders`
- [ ] `/dashboard/inventory`
- [ ] `/dashboard/categories`
- [ ] `/dashboard/conversations`
- [ ] `/dashboard/analytics`
- [ ] `/dashboard/settings`
- [ ] `/store/[slug]`
- [ ] `/track/[slug]`
- [ ] `/admin/login`
- [ ] `/admin`
- [ ] `/offline`
- [ ] `/privacy`
- [ ] `/terms`

### 14.4 State matrix

Test all important states:

#### Orders

- 0 orders.
- 1 new order.
- 3 pending orders.
- 50 active/history orders.
- 200+ history orders.
- Paid order.
- COD order.
- Failed payment.
- Cancelled order.
- Delivery order.
- Pickup order.

#### Inventory

- 0 products.
- 1 product.
- 20 products.
- 200 products.
- Low stock.
- Out of stock.
- Hidden product.
- Listed product.
- Image missing.
- Image present.
- CSV import success.
- CSV import row errors.

#### Storefront

- Store with products.
- Store with no products.
- Search no results.
- Cart empty.
- Cart with changed prices.
- Cart with removed product.
- Checkout success.
- Checkout validation error.
- Checkout network failure.

#### PWA

- First visit.
- Install prompt shown.
- Install prompt dismissed.
- Push permission default.
- Push permission granted.
- Push permission denied.
- Offline.
- Update available.

---

## 15. Implementation Phases

## Phase 0 — Baseline and screenshots

Tasks:

- [ ] Pull latest `main`.
- [ ] Install dependencies.
- [ ] Run `npm run verify`.
- [ ] Run `npm run test:e2e` if configured.
- [ ] Capture screenshots of current screens at 390px and desktop.
- [ ] Save screenshots under `docs/screenshots/ui-redesign/before/`.
- [ ] Update `docs/AGENT_PROGRESS.md`.

Acceptance:

- [ ] Existing baseline documented.
- [ ] Any failing command documented before UI changes.

## Phase 1 — Design tokens and primitives

Tasks:

- [ ] Update `app/globals.css`.
- [ ] Update `tailwind.config.ts`.
- [ ] Update `app/layout.tsx` theme/status colors.
- [ ] Refactor Button.
- [ ] Refactor Card.
- [ ] Refactor Input/Field.
- [ ] Refactor Badge/StatusBadge.
- [ ] Refactor Drawer/Modal/Toast if needed.
- [ ] Add SegmentedControl, SearchField, ActionBar, StickyBottomAction.
- [ ] Update design-system preview route.

Acceptance:

- [ ] Primitives show final light theme.
- [ ] No major route breaks.
- [ ] `npm run verify` passes.

## Phase 2 — App shell and navigation

Tasks:

- [ ] Redesign ShopDashboardShell.
- [ ] Redesign TopBar.
- [ ] Redesign bottom nav.
- [ ] Redesign More sheet.
- [ ] Redesign sidebar.
- [ ] Polish impersonation banner.
- [ ] Polish PWA install/update/push prompts.

Acceptance:

- [ ] Shell feels iOS-native.
- [ ] Safe area works.
- [ ] All nav links work.
- [ ] Bottom nav does not cover content.

## Phase 3 — Auth and onboarding

Tasks:

- [ ] Redesign AuthShell/login/signup/forgot.
- [ ] Redesign onboarding wizard.
- [ ] Hide advanced WhatsApp credentials behind sheet.
- [ ] Add launch checklist.
- [ ] Add mobile sticky action.

Acceptance:

- [ ] Seller can complete onboarding on iPhone.
- [ ] Technical Meta setup optional/deferred.
- [ ] Forms are accessible.

## Phase 4 — Live orders dashboard

Tasks:

- [ ] Redesign dashboard home hierarchy.
- [ ] Redesign KPI cards.
- [ ] Redesign setup checklist card.
- [ ] Redesign live order cards.
- [ ] Redesign detail sheet.
- [ ] Move filters into mobile sheet.
- [ ] Preserve desktop board/DnD.
- [ ] Add/adjust tests.

Acceptance:

- [ ] New order processing is fast.
- [ ] Status/payment labels clear.
- [ ] Empty states polished.

## Phase 5 — Inventory and categories

Tasks:

- [ ] Redesign inventory health summary.
- [ ] Redesign product cards/list.
- [ ] Add quick stock sheet.
- [ ] Redesign product editor sheet.
- [ ] Redesign bulk mode.
- [ ] Redesign CSV import/export UX.
- [ ] Redesign categories route.

Acceptance:

- [ ] Inventory usable one-handed.
- [ ] Product add/edit/stock flows remain functional.
- [ ] Category route polished.

## Phase 6 — Chats, analytics, settings

Tasks:

- [ ] Redesign conversations list/detail.
- [ ] Redesign analytics cards/charts/empty states.
- [ ] Redesign settings sections/sheets.
- [ ] Improve WhatsApp/payment status cards.

Acceptance:

- [ ] All secondary seller routes match final design.
- [ ] No raw technical-looking screens remain.

## Phase 7 — Public storefront and tracking

Tasks:

- [ ] Redesign store header/search/categories.
- [ ] Redesign product cards.
- [ ] Add sticky cart bar.
- [ ] Add cart sheet.
- [ ] Add checkout sheet.
- [ ] Add success screen.
- [ ] Redesign tracking page.

Acceptance:

- [ ] Customer storefront feels real and trustworthy.
- [ ] Checkout works smoothly.
- [ ] Tracking page polished.

## Phase 8 — Admin console alignment

Tasks:

- [ ] Redesign admin layout with final tokens.
- [ ] Redesign admin overview.
- [ ] Redesign seller list/detail.
- [ ] Ensure impersonation state is obvious.
- [ ] Fix mobile overflow.

Acceptance:

- [ ] Admin is usable and aligned.
- [ ] Seller support workflows remain safe.

## Phase 9 — PWA assets and manual iPhone QA

Tasks:

- [ ] Generate correct icon sizes.
- [ ] Add apple-touch-icon.
- [ ] Update manifest colors/scope/icons.
- [ ] Test standalone installed PWA.
- [ ] Test normal Safari.
- [ ] Test push prompt states.
- [ ] Test offline/update states.
- [ ] Capture after screenshots.

Acceptance:

- [ ] Installed PWA icon and name look good.
- [ ] Status bar/safe areas correct.
- [ ] No hidden controls.

## Phase 10 — Final proof and docs

Tasks:

- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run verify`.
- [ ] Run `npm run test:e2e`.
- [ ] Update README if UI docs changed.
- [ ] Update `docs/AGENT_PROGRESS.md`.
- [ ] Add final screenshot links.
- [ ] List any deferred items with reason.

Acceptance:

- [ ] Everything passes or blockers are honestly documented.
- [ ] User can hand repo to another agent without repeating context.

---

## 16. Visual Regression Checklist

For every changed route, capture before/after screenshots:

- Mobile 375.
- Mobile 390.
- Mobile 430.
- Desktop 1280.

Compare:

- No horizontal overflow.
- No text clipped.
- No buttons behind bottom nav.
- No header overlap.
- No black old-theme islands unless intentional.
- No raw unstyled inputs.
- No inconsistent card radii.
- No mixed old/new button styles.
- No broken icon alignment.
- No unreadable badge contrast.
- No long labels wrapping badly.

---

## 17. Component Acceptance Criteria

### Button

- [ ] All variants light-theme correct.
- [ ] Loading spinner visible.
- [ ] Disabled state clear.
- [ ] 44px target.

### Card

- [ ] Consistent radius.
- [ ] Consistent border/shadow.
- [ ] Interactive focus state.

### Input

- [ ] 16px font.
- [ ] Label visible.
- [ ] Error visible.
- [ ] Keyboard type correct.

### Sheet/Drawer

- [ ] Safe-area bottom.
- [ ] Sticky header/footer.
- [ ] Focus management.
- [ ] Escape/overlay close.

### Toast

- [ ] Does not cover CTA.
- [ ] Error copy useful.
- [ ] Success copy short.

### EmptyState

- [ ] Title/body/action.
- [ ] Helpful for next step.

### StatusBadge

- [ ] Labels human-readable.
- [ ] Not color-only.
- [ ] Payment/order/inventory distinct.

---

## 18. UX Bug List to Hunt During Redesign

The agent must actively look for these while implementing:

- [ ] Header content hidden behind notch/Dynamic Island.
- [ ] Bottom CTA hidden behind iOS home indicator.
- [ ] iOS input zoom due to font below 16px.
- [ ] Fixed bottom nav covering last list item.
- [ ] Modals too tall for mobile.
- [ ] Popovers cut off on small screens.
- [ ] Horizontal scrolling from tables/cards.
- [ ] Long store/product names breaking layouts.
- [ ] Order status and payment status confused.
- [ ] Buttons too close to destructive actions.
- [ ] Empty states with no action.
- [ ] Loading spinner with no context.
- [ ] Toast covering checkout/order action.
- [ ] Form submit not disabled while loading.
- [ ] Optimistic updates not rolling back on failure.
- [ ] Raw Supabase/API error shown to user.
- [ ] QR/store link copy action has no success feedback.
- [ ] Notifications prompt appears too early.
- [ ] Install banner appears on unsupported/browser-inappropriate contexts.
- [ ] Offline state pretending actions succeeded.
- [ ] Old dark classes remaining in redesigned pages.
- [ ] Mixed font families.
- [ ] Mixed radii.
- [ ] Tiny 10px labels where 11–12px is needed.
- [ ] Missing `aria-label` for icon buttons.
- [ ] Drag-and-drop with no keyboard/touch alternative.
- [ ] Customer storefront showing seller/admin styling.
- [ ] Admin impersonation banner too subtle.

---

## 19. Suggested File/Folder Structure After Redesign

```txt
components/
  ui/
    ActionBar.tsx
    AppShell.tsx
    AppTopBar.tsx
    Badge.tsx
    BottomTabBar.tsx
    Button.tsx
    Card.tsx
    ConfirmDialog.tsx
    Drawer.tsx
    EmptyState.tsx
    Field.tsx
    FilterChips.tsx
    Input.tsx
    Modal.tsx
    PageHeader.tsx
    SearchField.tsx
    SegmentedControl.tsx
    Skeleton.tsx
    StatusBadge.tsx
    StickyBottomAction.tsx
    Toast.tsx
  dashboard/
    ShopDashboardShell.tsx
    TopBar.tsx
    MobileMoreSheet.tsx
    PWAInstallBanner.tsx
    PWAUpdateBanner.tsx
    PushPrompt.tsx
    SetupChecklistCard.tsx
    DashboardHomeInsights.tsx
  orders/
    OrderCard.tsx
    OrderDetailPanel.tsx
    OrderStatusStepper.tsx
    PaymentBadge.tsx
  inventory/
    ProductCard.tsx
    ProductEditorSheet.tsx
    StockAdjustSheet.tsx
    InventoryLedgerPanel.tsx
  storefront/
    StoreHeader.tsx
    ProductCard.tsx
    CartBar.tsx
    CartSheet.tsx
    CheckoutSheet.tsx
    StoreEmptyState.tsx
```

Do not move everything at once if risky. Refactor safely.

---

## 20. Final Agent Prompt

Use this prompt if launching another agent:

```txt
You are working on https://github.com/ruddvz/Porter.

Your task is to complete the Porter iOS PWA UI/UX redesign using docs/PORTER_IOS_PWA_UI_UX_REDESIGN_MASTER_PLAN.md as the source of truth.

Do not stop after one small fix. Work phase by phase until all P0/P1/practical P2 UI/UX items are complete. Preserve all existing functionality: seller auth, onboarding, dashboard, live orders, inventory, categories, chats, settings, public storefront, tracking, admin, WhatsApp, Razorpay, Gemini, Supabase, PWA service workers, push prompts, and webhooks.

The final product must be a premium light iOS-first local-retail SaaS PWA, not the current dark/neon prototype. Use the Porter Fresh Ops design system: warm cream background, white rounded cards, emerald primary, saffron accent, soft shadows, iOS safe-area handling, and touch-friendly mobile UX.

Start by capturing the current UI baseline. Then implement design tokens/primitives, dashboard shell, onboarding/auth, live orders, inventory/categories, chats/analytics/settings, public storefront/tracking, admin alignment, PWA assets, and final QA.

Update docs/AGENT_PROGRESS.md after every phase with what changed, commands run, screenshots captured, what passed, what failed, and what remains. Run lint/typecheck/test/build/verify after phases. Only stop for true external blockers such as missing private credentials or owner-only production settings.
```

---

## 21. Final Manual QA Script for Owner/Agent

Run this on a real iPhone after deployment:

1. Open app in Safari.
2. Sign in.
3. Complete onboarding with WhatsApp setup skipped.
4. Add a product.
5. Add stock.
6. Open public store.
7. Add product to cart.
8. Checkout.
9. Track order.
10. Return to dashboard.
11. Accept order.
12. Change order status.
13. Open inventory and mark product low/out of stock.
14. Open chats.
15. Open analytics.
16. Open settings.
17. Install to Home Screen.
18. Open installed PWA.
19. Confirm status bar/topbar safe area.
20. Confirm bottom nav/home indicator safe area.
21. Toggle offline/airplane mode and open app.
22. Reconnect.
23. Trigger update banner if possible.
24. Test push prompt permission flow.
25. Capture screenshots.

Pass/fail each item in `docs/AGENT_PROGRESS.md`.

---

## 22. Do Not Ship Until These Are Fixed

- [ ] Current dark/neon UI is no longer the default seller/customer look.
- [ ] Storefront is no longer a plain list/cart form.
- [ ] Onboarding no longer exposes scary technical setup as a mandatory-feeling step.
- [ ] Inventory mobile view is no longer a dense control wall.
- [ ] Live orders mobile view is action-first, not board-first.
- [ ] Bottom nav is safe-area-aware and polished.
- [ ] Topbar is safe-area-aware and not cramped.
- [ ] Manifest/icons/status colors match final design.
- [ ] No important route has horizontal overflow at 375px.
- [ ] All major empty/loading/error states are designed.
- [ ] All validation commands pass or blockers are documented.

---

## 23. Owner Summary

The current Porter product is functionally ambitious and useful, but the UI needs one strong design direction. The correct direction is not more dark/neon WhatsApp styling. Porter should become a polished light iOS PWA for local sellers: cream background, white rounded cards, emerald green primary actions, saffron accents, clean safe-area shell, bottom nav, sheets, mobile cards, and clear action-first workflows.

This plan is intentionally implementation-heavy so an agent can keep working without asking for “next steps.”
