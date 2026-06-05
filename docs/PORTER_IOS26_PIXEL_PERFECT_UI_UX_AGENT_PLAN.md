# Porter — iOS 26 Pixel-Perfect UI/UX Agent Plan

**Repo:** `https://github.com/ruddvz/Porter`  
**Live GitHub Pages screenshot reviewed:** iPhone Safari view showing the static `ruddvz.github.io` preview page, not the real dashboard.  
**Prepared for:** autonomous implementation agent  
**Primary device:** iPhone Safari + installed iOS PWA  
**Secondary device:** iPad and desktop. **Important:** iPad must use the same layout family as desktop, not a stretched phone layout.  
**Design style:** premium light iOS 26 retail SaaS, soft squircle cards, warm Indian local-store feel, emerald primary actions, saffron accents, safe-area-aware shell.

---

## 0. Read This First — Agent Operating Contract

You are the implementation agent for Porter. Your job is not to change one card, change one color, or stop after the first visible improvement.

You must work through this entire plan until Porter feels like a polished production iOS PWA for real Indian/local retailers.

### Non-negotiable rules

1. Do not stop after one small fix.
2. Do not ask the owner “what next?” after each phase.
3. Work phase by phase until every P0/P1 item is complete and every practical P2 item is complete.
4. Preserve existing product functionality.
5. Preserve seller auth, onboarding, dashboard, orders, inventory, categories, chats, analytics, settings, public storefront, checkout, tracking, admin, WhatsApp, Razorpay, Gemini, Supabase, service workers, push prompts, install prompts, and webhooks.
6. Do not turn this into a generic ecommerce template.
7. Do not keep the current GitHub Pages preview looking like a random README card.
8. Do not ship a dark/neon/default developer UI as the main look.
9. Do not use iPad as stretched mobile. iPad = desktop/tablet layout family.
10. Do not leave any page visually abandoned.
11. Do not leave any component with random radius, random shadows, random colors, or random spacing.
12. Do not leave any important action behind the iPhone home indicator, Safari bottom bar, Dynamic Island, notch, or keyboard.
13. Every button/tappable control must have at least 44×44 px touch target.
14. All inputs must use 16px minimum text size to prevent iOS input zoom.
15. Use system font stack / SF Pro style. No decorative heading font inside operational dashboard UI.
16. Use semantic status colors consistently across seller dashboard, storefront, tracking, admin, notifications, analytics, and WhatsApp status copy.
17. Update `docs/AGENT_PROGRESS.md` after every phase with exact files changed, commands run, screenshots captured, pass/fail state, and blockers.
18. Only stop for true blockers: missing private credentials, destructive database migration approval, production owner settings, or a genuine security/legal blocker.

### Required implementation loop

For every phase:

```bash
git checkout main
git pull
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Then:

1. Create a focused branch.
2. Capture before screenshots.
3. Implement one phase.
4. Run validation.
5. Capture after screenshots.
6. Update `docs/AGENT_PROGRESS.md`.
7. Commit with a clean message.
8. Open/merge PR or prepare the branch.
9. Continue to the next phase.

Suggested branch naming:

```txt
ui/phase-01-pages-launcher
ui/phase-02-tokens-primitives
ui/phase-03-ios-shell
ui/phase-04-auth-onboarding
ui/phase-05-live-orders
ui/phase-06-inventory-categories
ui/phase-07-storefront-checkout
ui/phase-08-tracking
ui/phase-09-chats-analytics-settings
ui/phase-10-admin-console
ui/phase-11-pwa-assets-states
ui/phase-12-accessibility-qa
```

---

## 1. What Is Wrong Right Now

### 1.1 GitHub Pages problem from the screenshot

The current iPhone Safari screenshot shows a static GitHub Pages page with:

- A dark background.
- Big `Porter` heading.
- Green all-caps tagline.
- Paragraph explaining that GitHub Pages only serves this static page.
- A bordered card with `Run the real Porter app`.
- A Vercel deploy button.
- A README button.
- Another card explaining where to see the UI.
- Safari bottom address bar covering or visually competing with the lower content.

This page is technically correct but product-wise it feels bad. It makes Porter look like a setup note instead of a serious seller product.

The user’s complaint is valid: when opening the website, it does not show a dashboard, does not feel premium, and does not feel finished.

### 1.2 Why the page currently exists

GitHub Pages can only serve the static `docs/` page. The real dashboard, API routes, webhooks, seller console, admin console, auth, and server logic live in the Next.js app and need Vercel or equivalent server hosting. The plan must therefore fix two things:

1. Make the GitHub Pages static page beautiful and honest.
2. Make the Vercel-hosted real app beautiful and complete.

### 1.3 Current product direction

Porter is a WhatsApp-first ordering and operations SaaS for Indian/local retailers. Sellers should be able to:

1. Sign up.
2. Create a store.
3. Connect WhatsApp or skip advanced setup first.
4. Add inventory.
5. Organize categories.
6. Receive and manage orders.
7. Chat with customers.
8. Manage payments/COD/UPI/Razorpay states.
9. Track analytics.
10. Share public store links.
11. Let customers track orders.
12. Use admin tools safely.
13. Install it as a daily iPhone PWA.

### 1.4 Current UI risk

The app has enough real functionality that a rough UI makes it look worse than it is. The job is to make every surface communicate:

- This is trustworthy.
- This is fast.
- This understands Indian retail workflows.
- This works on an iPhone in a shop.
- This is not a random GitHub demo.

---

## 2. Final Design Direction

### 2.1 Product feel

Porter should feel like:

> A premium, calm, iPhone-native operations app for local retailers who sell through WhatsApp, phone orders, public store links, COD, UPI, and Razorpay.

### 2.2 Design language

Use this internal design language:

**Porter Fresh Ops — iOS 26**

Core attributes:

- Light first.
- Warm cream app background.
- White and off-white cards.
- Emerald green primary actions.
- Saffron/orange accent for retail warmth.
- Calm dark navy/charcoal text.
- Soft shadows.
- iOS 26 squircle surfaces.
- Glassy but not blurry to the point of unreadability.
- Large tap targets.
- One-handed seller operations.
- Clear order/payment states.
- Customer storefront separated from seller/admin UI.

### 2.3 Anti-goals

Avoid:

- Dark developer landing page as first impression.
- Neon green everything.
- Huge paragraphs above the fold.
- Dashboard looking like a README.
- Desktop tables on mobile.
- Tiny 10px tap targets.
- Multiple button styles fighting each other.
- Mixed radii like 8, 12, 16, 24, 32 randomly.
- Random shadows and borders.
- Overly technical WhatsApp setup language.
- Showing secret/token concepts too early.
- Generic ecommerce layouts that ignore WhatsApp ordering.
- Customer pages using admin styling.
- Admin pages using customer storefront styling.
- Empty states that look broken.
- Loading states with only a spinner.
- Toast spam.
- Horizontal overflow at 375px.
- Sticky CTA hidden behind Safari or Home indicator.

---

## 3. Device Targets and Pixel Rules

### 3.1 Mobile widths

Every primary route must be tested at:

```txt
320px   iPhone SE legacy stress test
375px   iPhone SE / small iPhone
390px   standard modern iPhone
393px   common modern iPhone viewport
402px   iPhone 16/17 style viewport if available
430px   Pro Max class
```

### 3.2 Tablet/Desktop widths

Test:

```txt
768px    iPad portrait
820px    iPad Air portrait
1024px   iPad landscape / desktop minimum
1280px   desktop
1440px   large desktop
```

### 3.3 iPad rule

At `768px+`, do not use phone bottom nav as the primary structure.

Use:

- left rail or sidebar
- max-width content grid
- two-column layouts where useful
- persistent filters on the side where appropriate
- detail panels instead of full-screen sheets when width allows

### 3.4 iPhone safe-area rules

Use:

```css
--safe-top: env(safe-area-inset-top, 0px);
--safe-right: env(safe-area-inset-right, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
--safe-left: env(safe-area-inset-left, 0px);
```

Every page shell must reserve:

```css
padding-top: calc(var(--safe-top) + header-height);
padding-bottom: calc(var(--safe-bottom) + bottom-nav-height + 16px);
```

For Safari browser mode, also ensure scrollable content has enough bottom padding so the address bar does not visually cover the last CTA.

### 3.5 Touch targets

Minimums:

```txt
Icon button: 44×44
Primary CTA: 48px height minimum
Bottom nav item: 56px visual height, 44px tap area minimum
List row action: 44×44
Sheet close: 44×44
Checkbox/radio custom hit area: 44×44
```

### 3.6 Spacing grid

Use a 4px base grid with 8px rhythm.

```txt
2px  hairline/inset only
4px  micro gap
6px  chip inner gap
8px  compact gap
12px card inner group gap
16px standard card padding mobile
20px comfortable card padding
24px section gap mobile
28px large card radius / desktop gap
32px major section gap
```

### 3.7 Radius system

Use only these radii:

```css
--radius-xs: 10px;
--radius-sm: 14px;
--radius-md: 18px;
--radius-lg: 22px;
--radius-xl: 28px;
--radius-2xl: 34px;
--radius-pill: 999px;
```

Mapping:

```txt
Small chip: 999px
Input: 16px
Small card: 18px
Normal card: 22px
Hero card: 28px
Modal/sheet: 28px mobile, 30px desktop
Bottom nav pill: 999px outer, 18px active pill
iOS launcher/static page cards: 28px / squircle
```

Do not use random one-off radii.

---

## 4. Final Design Tokens

### 4.1 Required CSS tokens

Update `app/globals.css` and Tailwind config to consolidate around these values.

```css
:root {
  --po-bg: #fff8ec;
  --po-bg-soft: #fffdf7;
  --po-bg-warm: #fff4df;

  --po-surface: #ffffff;
  --po-surface-raised: #fffaf1;
  --po-surface-glass: rgba(255, 255, 255, 0.78);
  --po-surface-green: #f0f9f2;
  --po-surface-orange: #fff1df;

  --po-text: #111827;
  --po-text-soft: #344054;
  --po-muted: #667085;
  --po-muted-2: #98a2b3;
  --po-placeholder: #9aa4b2;

  --po-line: #eadfce;
  --po-line-strong: #dac9af;
  --po-line-soft: rgba(234, 223, 206, 0.58);

  --po-primary: #0f7a3a;
  --po-primary-hover: #0b6930;
  --po-primary-pressed: #07592a;
  --po-primary-soft: #e7f6eb;
  --po-primary-ring: rgba(15, 122, 58, 0.24);

  --po-whatsapp: #25d366;
  --po-whatsapp-dark: #128c7e;
  --po-whatsapp-soft: #e9fbee;

  --po-accent: #f26b00;
  --po-accent-hover: #d85f00;
  --po-accent-soft: #fff1df;

  --po-success: #15803d;
  --po-success-soft: #e8f7ee;

  --po-warning: #b77900;
  --po-warning-soft: #fff6d7;

  --po-danger: #d83b32;
  --po-danger-soft: #fdecea;

  --po-info: #2563eb;
  --po-info-soft: #eff6ff;

  --po-purple: #6d5bd0;
  --po-purple-soft: #f1efff;

  --po-focus: #0f7a3a;

  --po-shadow-card: 0 10px 28px rgba(17, 24, 39, 0.06);
  --po-shadow-card-hover: 0 16px 36px rgba(17, 24, 39, 0.09);
  --po-shadow-floating: 0 18px 48px rgba(17, 24, 39, 0.12);
  --po-shadow-sheet: 0 -18px 48px rgba(17, 24, 39, 0.14);

  --po-radius-xs: 10px;
  --po-radius-sm: 14px;
  --po-radius-md: 18px;
  --po-radius-lg: 22px;
  --po-radius-xl: 28px;
  --po-radius-2xl: 34px;
  --po-radius-pill: 999px;

  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);

  --app-topbar-height: 64px;
  --app-bottom-nav-height: 78px;
}
```

### 4.2 Typography

Use system-first Apple-like stack:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, Segoe UI, sans-serif;
```

Do not use `Bebas Neue` or decorative display fonts in operational dashboard screens.

Allowed type scale:

```txt
Display XL: 34 / 40 / 760 / -0.04em
Display:    30 / 36 / 750 / -0.035em
H1:         26 / 32 / 740 / -0.03em
H2:         22 / 28 / 720 / -0.025em
H3:         18 / 24 / 700 / -0.018em
Body L:     16 / 24 / 450
Body:       15 / 22 / 450
Body S:     14 / 20 / 450
Caption:    12 / 16 / 600
Tiny:       11 / 14 / 650 uppercase tracking 0.04em only for labels
```

Rules:

- Use at least 16px inside inputs.
- Do not use all caps for long text.
- Use uppercase only for tiny metadata labels.
- Use tabular numbers for money, counts, and order IDs.
- Use `₹` correctly and ensure fonts render it.

### 4.3 Shadows

Use only:

```txt
Card:       0 10px 28px rgba(17, 24, 39, 0.06)
Raised:     0 16px 36px rgba(17, 24, 39, 0.09)
Floating:   0 18px 48px rgba(17, 24, 39, 0.12)
Sheet:      0 -18px 48px rgba(17, 24, 39, 0.14)
Focus ring: 0 0 0 4px rgba(15, 122, 58, 0.16)
```

No neon glow shadows except optional tiny WhatsApp status dot animation.

---

## 5. Core Component System

Create or refactor shared UI components. Do not keep re-creating buttons/cards inside each page.

Target folder:

```txt
components/ui/
  AppShell.tsx
  AppTopBar.tsx
  BottomTabBar.tsx
  Sidebar.tsx
  Button.tsx
  IconButton.tsx
  Card.tsx
  HeroCard.tsx
  MetricCard.tsx
  ListRow.tsx
  Field.tsx
  Input.tsx
  Textarea.tsx
  Select.tsx
  SearchField.tsx
  SegmentedControl.tsx
  Chip.tsx
  StatusBadge.tsx
  PaymentBadge.tsx
  SourceBadge.tsx
  EmptyState.tsx
  ErrorState.tsx
  LoadingState.tsx
  Skeleton.tsx
  Banner.tsx
  Toast.tsx
  BottomSheet.tsx
  Modal.tsx
  Drawer.tsx
  ConfirmDialog.tsx
  StickyActionBar.tsx
  ActionMenu.tsx
  ProgressStepper.tsx
  StatDelta.tsx
  TableToCards.tsx
```

### 5.1 Button

Variants:

```txt
primary       emerald filled
secondary     white surface with border
soft          tinted surface
ghost         transparent
danger        red filled or red soft depending risk
whatsapp      WhatsApp green only for WhatsApp-specific actions
link          text button
```

Sizes:

```txt
sm: 36px height, only desktop or dense rows
md: 44px height
lg: 48px height mobile default
xl: 54px hero CTA
```

Button anatomy:

```txt
height: 48px mobile primary
padding-x: 18px mobile, 20px desktop
radius: pill for primary/secondary CTAs
font: 15px / 20px / 700
icon: 18px
icon gap: 8px
```

Rules:

- Never put two filled primary buttons next to each other.
- Destructive action must not be next to primary action without spacing or confirmation.
- Loading button shows spinner + same width if possible.
- Disabled button still readable.
- All icon-only buttons need `aria-label`.

### 5.2 Card

Variants:

```txt
base          white, border, soft shadow
raised        stronger shadow for important card
soft          warm off-white surface
green         success/WhatsApp setup card
orange        attention/setup card
danger        warning/destructive state card
flat          no shadow, border only
```

Anatomy:

```txt
mobile padding: 16px
comfortable padding: 20px
radius: 22px
border: 1px solid var(--po-line)
shadow: var(--po-shadow-card)
```

Rules:

- Cards must not use random `rounded-xl`, `rounded-2xl`, `rounded-[28px]` everywhere. Use shared component.
- Cards should have title, optional subtitle, optional action slot.
- Dense cards should become `ListRow` instead.

### 5.3 HeroCard

Use for:

- GitHub Pages launch card.
- Seller dashboard urgent card.
- Onboarding current step.
- Storefront shop header.
- Tracking current status.

Anatomy:

```txt
radius: 28px
padding mobile: 20px
background: gradient from white to warm cream or green soft
border: 1px solid line
shadow: card
```

Must include:

- Short title.
- One sentence explanation.
- One primary CTA.
- Optional secondary CTA.
- Optional compact stats row.

### 5.4 MetricCard

Use for dashboard stats.

Anatomy:

```txt
label: 12px muted uppercase or sentence label
value: 24-30px tabular
subtext: 12-13px muted
optional icon container: 36px squircle
optional delta badge
```

Mobile grid:

```txt
2 columns at 375px
4 columns desktop
```

### 5.5 ListRow

Use for settings, orders summaries, product rows, notifications.

Anatomy:

```txt
height: minimum 64px
left icon/avatar: 40px squircle
main title: 15px semibold
subtitle: 13px muted
right accessory: chevron, badge, switch, amount, or status
```

### 5.6 Field/Input

Anatomy:

```txt
label: 13px / 600
helper: 13px muted
input height: 48px
input text: 16px
radius: 16px
border: line
focus: emerald ring
error: red border + inline error
```

Rules:

- Never show raw technical validation messages to sellers/customers.
- Keep error text human.
- Use proper keyboard types: phone, email, number, decimal, url.
- Add `autocomplete` values for name, email, tel, address, postal-code where useful.
- Add clear buttons to search fields.

### 5.7 SegmentedControl

Use for:

- Order status segments.
- Inventory availability.
- Analytics range.
- Storefront category filters.
- Admin status filters.

Anatomy:

```txt
height: 40-44px
outer radius: 999px
active pill: 34-38px height
font: 13px / 600
```

Must support horizontal scroll on 320/375px if there are many segments.

### 5.8 StatusBadge

One source of truth:

```txt
pending            orange soft
awaiting_payment   amber soft
confirmed          blue soft
preparing          purple soft
ready              green soft
out_for_delivery   blue soft
delivered          green soft
cancelled          red soft
failed             red soft
refunded           gray soft
```

Payment statuses:

```txt
cod                amber soft
upi_pending        amber soft
paid               green soft
failed             red soft
refunded           gray soft
```

Rules:

- Never use similar colors for payment and order status without labels.
- Always include text, not color only.
- Icons optional but consistent.

### 5.9 BottomSheet

Mobile only primary pattern.

Anatomy:

```txt
fixed inset-x: 0 bottom: 0
max-height: calc(100dvh - safe-top - 24px)
border-radius top: 28px
padding bottom: calc(16px + safe-bottom)
drag handle: 36×4 px
```

Use for:

- More nav.
- Filters.
- Product editor.
- Stock adjustment.
- Checkout.
- Order detail on mobile.
- Profile menu.
- Notification list.

### 5.10 Drawer/DetailPanel

Desktop/tablet pattern.

Use for:

- Order detail.
- Product detail/edit.
- Admin seller detail.
- Conversation detail.

Rules:

- On iPhone, same content becomes bottom sheet/full-screen sheet.
- On desktop, use right-side panel with max width 420-520px.

### 5.11 Toast

Toast types:

```txt
success
error
warning
info
undo
```

Rules:

- Toast appears above bottom nav / sticky CTA.
- It must not cover the primary action.
- Error toast should also have inline error where context matters.
- No duplicate spam toasts.
- Screen reader region required.

### 5.12 EmptyState

Every empty state must include:

1. Friendly icon/illustration.
2. Short title.
3. Useful explanation.
4. Primary action.
5. Optional secondary action.

Bad:

```txt
No data found.
```

Good:

```txt
No live orders yet.
Share your store link or connect WhatsApp to start receiving orders.
[Copy store link] [Setup WhatsApp]
```

### 5.13 LoadingState

Do not use generic full-page spinners everywhere.

Use:

- Skeleton cards for dashboards.
- Skeleton product cards for storefront.
- Inline spinner for button actions.
- Progress copy for setup/import/deploy states.

### 5.14 ErrorState

Use clear human copy:

```txt
We could not load orders.
Your internet may be slow or the server could not respond. Try again.
[Retry]
```

Do not show raw Supabase, Next.js, or SQL errors to sellers/customers.

---

## 6. Immediate P0 — Fix the GitHub Pages Static Preview

This is the exact issue visible in the user screenshot.

### 6.1 Goal

The GitHub Pages URL must no longer feel like an ugly technical note. It must feel like a polished Porter launcher.

It still must be honest: GitHub Pages is only a static preview. The real app must run on Vercel or another Next.js host.

### 6.2 Required UX

When user opens `ruddvz.github.io/Porter/`, the page should show:

1. A premium app-like hero.
2. Clear `Porter` identity.
3. One direct primary CTA.
4. A clear status card explaining whether live app URL is configured.
5. A beautiful “Preview only” label.
6. A short explanation, not long README text.
7. A polished iPhone-safe layout.
8. No bottom content hidden behind Safari UI.

### 6.3 Static page states

#### State A — `PORTER_LIVE_URL` configured

Hero:

```txt
Porter
WhatsApp-first ordering for local retailers.
Your real Porter app is ready.
```

Primary CTA:

```txt
Open Porter Dashboard
```

Secondary CTA:

```txt
View setup docs
```

Card:

```txt
Live app connected
Seller dashboard, admin console, APIs, webhooks, tracking links, and storefront are served by your Vercel deployment.
```

#### State B — no live URL configured

Hero:

```txt
Porter
A calm operating system for stores that sell on WhatsApp.
```

Primary CTA:

```txt
Deploy real app on Vercel
```

Secondary CTA:

```txt
Open setup checklist
```

Card:

```txt
Preview page only
GitHub Pages can show this launcher, but dashboards, login, APIs, webhooks, checkout, and admin need the Next.js deployment.
```

### 6.4 Visual redesign specs

For `docs/index.html` and related static CSS:

```txt
body background: #fff8ec
text: #111827
page max width mobile: 430px
page max width desktop: 1120px
mobile horizontal padding: 20px
safe bottom padding: calc(env(safe-area-inset-bottom) + 112px)
hero card radius: 30px
hero padding: 24px mobile, 36px desktop
primary button height: 52px
secondary button height: 48px
card gap: 16px mobile, 24px desktop
```

Do not use a black full-screen background for the static preview.

### 6.5 Static page layout mobile

Order:

1. Tiny top status pill: `Preview launcher`.
2. Logo/wordmark row.
3. H1: `Run Porter like an app.`
4. Subtitle: `Seller dashboard, orders, inventory, chats, tracking, and admin live in the Next.js app.`
5. Primary CTA.
6. Secondary CTA.
7. Status card.
8. Three feature cards:
   - Seller dashboard
   - Customer tracking
   - Admin console
9. Setup checklist accordion.
10. Footer links.

### 6.6 Static page desktop/iPad

At `768px+`:

- Use two-column hero.
- Left: copy and CTA.
- Right: iPhone-style preview mock card with mini dashboard UI.
- Below: 3 cards in row.
- Footer compact.

### 6.7 Static preview mockup card

Create a simple non-functional visual card:

```txt
Today
3 orders need action
₹4,820 sales
Low stock: 6 items
[Review orders]
```

This makes the page feel like a product without pretending the dashboard is running there.

### 6.8 Acceptance criteria

- [ ] Opening GitHub Pages on iPhone no longer looks like a README card.
- [ ] User understands this is a launcher, not a broken dashboard.
- [ ] Primary CTA is visible above the fold.
- [ ] If live URL exists, `Open Porter Dashboard` is the main CTA.
- [ ] If no live URL exists, Vercel deploy is the main CTA.
- [ ] No content is hidden behind Safari bottom bar.
- [ ] Page works at 320, 375, 390, 430, 768, 1024+ widths.
- [ ] Background, buttons, cards, typography match Porter Fresh Ops tokens.
- [ ] README remains accurate but no longer dominates the visual experience.

---

## 7. App Shell and Navigation

### 7.1 Files to inspect

```txt
components/dashboard/ShopDashboardShell.tsx
components/dashboard/TopBar.tsx
components/dashboard/MobileMoreSheet.tsx
components/ui/Sidebar.tsx
components/dashboard/PWAInstallBanner.tsx
components/dashboard/PWAUpdateBanner.tsx
components/dashboard/PushPrompt.tsx
app/dashboard/layout.tsx
```

### 7.2 Goal

The installed iOS PWA should feel like a native operations app.

### 7.3 Mobile shell structure

Top:

```txt
safe area
compact topbar 64px
```

Content:

```txt
main content max width 430px
padding x 16px
section spacing 20-24px
```

Bottom:

```txt
floating bottom nav pill
bottom: calc(env(safe-area-inset-bottom) + 10px)
height: 64-70px
```

### 7.4 TopBar redesign

Current `TopBar` includes `PORTER`, store name, title, bell, profile menu. Improve hierarchy.

Mobile topbar anatomy:

```txt
left: store avatar / initials 40×40 squircle
center: store name 14px semibold, page label 12px muted
right: bell 44×44, profile/menu 44×44
```

Do not show a giant `PORTER` wordmark in seller dashboard pages. Operational users already know the app.

### 7.5 Notification bell

Mobile: bottom sheet.

Title:

```txt
New orders
```

States:

```txt
No pending orders.
You are all caught up.
```

Item row:

```txt
Customer name
₹amount · time ago
status badge
```

CTA:

```txt
View live orders
```

### 7.6 Profile menu

Mobile: bottom sheet.

Rows:

```txt
Store settings
Inventory
View public store
Help and setup
Log out
```

If admin impersonating:

```txt
Exit admin view
```

### 7.7 Bottom nav

Primary mobile tabs:

```txt
Orders
Chats
Inventory
Analytics
More
```

Bottom nav specs:

```txt
position: fixed
left/right: 12px
bottom: calc(env(safe-area-inset-bottom) + 10px)
height: 66px
background: rgba(255,255,255,0.86)
backdrop-filter: blur(18px)
border: 1px solid rgba(234, 223, 206, 0.82)
box-shadow: 0 16px 40px rgba(17,24,39,0.14)
radius: 999px
```

Active state:

```txt
active icon container: warm/green soft pill
icon: emerald
label: emerald / 11px / 700
```

### 7.8 Desktop/iPad shell

At `768px+`:

- No bottom nav.
- Use left sidebar/rail.
- Use top header with page actions.
- Content max width 1180-1280px.
- Dashboard can use 12-column grid.
- Right detail panel can remain visible when selected.

### 7.9 Acceptance criteria

- [ ] Header does not overlap content.
- [ ] Bottom nav does not cover last list/card.
- [ ] Topbar feels compact and native.
- [ ] Active tab is obvious.
- [ ] More sheet exposes History, Categories, Settings, Store link, Help.
- [ ] Bell sheet is thumb-friendly.
- [ ] Profile sheet is thumb-friendly.
- [ ] iPad/desktop use sidebar, not mobile bottom nav.
- [ ] Impersonation banner is clear but not ugly.

---

## 8. Auth and Onboarding

### 8.1 Routes/files

```txt
app/auth/login
app/auth/signup
app/auth/callback
components/auth
app/onboarding
app/onboarding/ui.tsx
```

### 8.2 Auth design goals

Auth should feel safe, modern, and simple.

Mobile layout:

```txt
background: warm cream
center card: white, 28px radius
logo: top
headline: 28px
form fields: 48px
primary button: 52px
secondary OAuth button: 48px
```

### 8.3 Login page

Copy:

```txt
Welcome back to Porter
Manage orders, inventory, and WhatsApp sales from one place.
```

Fields:

```txt
Email
Password
```

Actions:

```txt
Sign in
Continue with Google (if enabled)
Forgot password
Create account
```

### 8.4 Signup page

Copy:

```txt
Start your store workspace
Set up orders, inventory, and customer updates in minutes.
```

Fields:

```txt
Name
Email
Password
Store phone optional
```

### 8.5 Onboarding flow

Current onboarding exposes technical WhatsApp fields too early. Rebuild as a guided seller wizard.

Steps:

```txt
1. Store basics
2. Delivery and payment
3. Add first products
4. WhatsApp setup
5. Review and launch
```

Progress stepper:

```txt
1 Store
2 Delivery
3 Products
4 WhatsApp
5 Launch
```

### 8.6 Onboarding Step 1 — Store basics

Fields:

```txt
Store name
Store category
Owner name
Store phone
City
Area/locality
```

Design:

- Hero card with store avatar preview.
- Inputs in grouped cards.
- Store category chips: Grocery, Fruits & vegetables, Pharmacy, Tiffin, Bakery, General store, Other.

### 8.7 Onboarding Step 2 — Delivery and payment

Fields:

```txt
Delivery mode: Pickup, Local delivery, Both
Minimum order
Delivery fee
Delivery areas
COD enabled
UPI enabled
Razorpay link optional
```

Use chips and simple toggles.

### 8.8 Onboarding Step 3 — Add first products

Options:

```txt
Add manually
Import CSV
Skip for now
Use sample inventory
```

Do not block seller if inventory is not ready.

### 8.9 Onboarding Step 4 — WhatsApp setup

This must not scare the seller.

Primary recommended card:

```txt
Start without WhatsApp automation
You can use Porter with manual orders and store links now. Connect WhatsApp automation later.
[Continue without automation]
```

Advanced card:

```txt
Connect WhatsApp Cloud API
For automated chat ordering. You will need Meta Business credentials.
[Open advanced setup]
```

Fields only inside advanced section:

```txt
Meta phone number ID
WhatsApp business account ID
Permanent access token
Verify token
```

### 8.10 Onboarding Step 5 — Review and launch

Checklist:

```txt
Store profile complete
Delivery configured
Payment options selected
First products added or skipped
WhatsApp automation skipped or configured
```

Primary CTA:

```txt
Open dashboard
```

### 8.11 Acceptance criteria

- [ ] User can reach dashboard without WhatsApp advanced setup.
- [ ] Technical token fields are hidden behind advanced setup.
- [ ] Every step has one obvious primary CTA.
- [ ] Inputs do not zoom on iPhone.
- [ ] Keyboard does not cover submit button.
- [ ] Seller can save and continue later if possible.
- [ ] Onboarding works at 320/375/390/430 widths.

---

## 9. Seller Dashboard Home / Live Orders

### 9.1 Files

```txt
app/dashboard/page.tsx
app/dashboard/ui.tsx
app/dashboard/components/LiveOrdersBoard.tsx
app/dashboard/components/*
components/orders/*
```

### 9.2 Primary job

The seller should know what needs action within 5 seconds.

### 9.3 Mobile layout order

```txt
1. Urgent action card
2. Today summary metrics
3. Setup checklist if incomplete
4. Live order segments
5. Order list/cards
6. Low-stock alert
7. Recent activity
```

### 9.4 Urgent action card

If pending/new orders exist:

```txt
3 orders need action
Accept, prepare, or contact customers before they wait too long.
[Review now]
```

If no pending orders:

```txt
All caught up
No live orders need action right now.
[Share store link]
```

### 9.5 Today summary metrics

Cards:

```txt
Orders today
Sales today
Pending now
Low stock
```

Mobile: 2×2 grid. Desktop: 4-card row.

### 9.6 Order filters

Mobile:

Segmented control:

```txt
New
Preparing
Delivery
Done
All
```

Secondary controls:

- Search icon opens search field.
- Filter button opens bottom sheet.
- Sort in filter sheet.

Desktop:

- Search visible.
- Date range visible.
- Filter chips visible.
- Kanban columns allowed.

### 9.7 Mobile order card anatomy

```txt
Top row:
  customer name
  order amount
  status badge

Second row:
  order ID short
  time ago
  payment badge

Items preview:
  2× Milk, 1× Bread + 3 more

Address/source row:
  WhatsApp / Store link / Manual
  area/locality

Action row:
  primary action based on status
  secondary menu
```

Status-based primary action:

```txt
pending -> Accept order
confirmed -> Start preparing
preparing -> Mark ready
ready -> Out for delivery
out_for_delivery -> Mark delivered
```

### 9.8 Desktop live orders

Desktop can use Kanban, but it must not look cramped.

Columns:

```txt
New
Confirmed
Preparing
Ready/Delivery
Done
```

Rules:

- Each column has count.
- Cards are 280-320px width.
- Detail panel opens on right.
- Drag-and-drop must have accessible fallback buttons.

### 9.9 Order detail sheet/panel

Mobile bottom sheet/full screen:

Sections:

```txt
Order summary
Customer
Items
Payment
Delivery
Timeline
Internal notes
Actions
```

Sticky bottom action:

- Primary status action.
- Secondary contact/action menu.

Desktop:

- Right side panel.
- Same content.

### 9.10 Empty states

No orders:

```txt
No orders yet
Share your store link or connect WhatsApp to start receiving orders.
[Copy store link] [Setup WhatsApp]
```

No filtered results:

```txt
No orders match this filter
Try another status, date range, or search.
[Clear filters]
```

### 9.11 Acceptance criteria

- [ ] 0 orders looks intentional.
- [ ] 1 order looks good.
- [ ] 10 orders scroll smoothly.
- [ ] 50/200 orders remain usable.
- [ ] Mobile never forces Kanban as the only pattern.
- [ ] Status and payment are never confused.
- [ ] Every status transition has feedback.
- [ ] Failed transition rolls back or shows clear error.
- [ ] Desktop Kanban still works.
- [ ] Drag-and-drop has fallback actions.

---

## 10. Inventory

### 10.1 Files

```txt
app/dashboard/inventory
components/inventory
```

### 10.2 Primary job

Seller should quickly add products, adjust stock, spot low-stock items, and control what appears in the store/bot.

### 10.3 Mobile layout

```txt
1. Inventory health hero
2. Search + filter row
3. Quick actions
4. Product list cards
5. Sticky Add product button
```

### 10.4 Inventory health hero

Metrics:

```txt
Products
Low stock
Out of stock
Hidden from store
```

CTA:

```txt
Add product
```

### 10.5 Product card anatomy

```txt
image/placeholder 56×56 squircle
name
category
price
stock count
store visibility badge
bot visibility badge
low stock badge if applicable
quick actions: + stock, edit, more
```

### 10.6 Product editor sheet

Fields:

```txt
Product image
Name
Category
Price
Unit
Stock quantity
Low stock threshold
Available in store toggle
Available in WhatsApp bot toggle
Description optional
SKU optional
```

Sticky actions:

```txt
Save product
Delete / Archive inside danger zone
```

### 10.7 Stock adjustment sheet

Modes:

```txt
Add stock
Remove stock
Set exact stock
Mark out of stock
```

Fields:

```txt
Quantity
Reason
Note optional
```

### 10.8 Bulk actions

Mobile:

- Long press or edit mode.
- Sticky selection bar.

Actions:

```txt
Show in store
Hide from store
Move category
Export selected
Archive
```

Desktop:

- Table/list hybrid allowed.
- Bulk toolbar at top.

### 10.9 Acceptance criteria

- [ ] Product list is readable at 375px.
- [ ] Add/edit product is a sheet on mobile.
- [ ] Stock adjustment requires fewer than 3 taps from product card.
- [ ] Low-stock products are obvious.
- [ ] Empty inventory teaches seller what to do.
- [ ] CSV import/export is available but not dominating primary mobile UI.
- [ ] Drag reorder does not block keyboard/touch alternatives.

---

## 11. Categories

### 11.1 Goal

Categories should help stores organize products for both storefront and WhatsApp bot browsing.

### 11.2 Mobile layout

```txt
1. Category summary card
2. Add category button
3. Reorderable category list
4. Category detail sheet
```

### 11.3 Category row

```txt
icon/color chip
category name
product count
visibility badge
reorder handle
```

### 11.4 Category editor

Fields:

```txt
Name
Slug auto-generated
Description optional
Display order
Visible in storefront
Visible in WhatsApp bot
```

Actions:

```txt
Save
Archive category
```

### 11.5 Acceptance criteria

- [ ] `/dashboard/categories` works from sidebar and More sheet.
- [ ] Empty state useful.
- [ ] Seller can add/edit/archive/reorder.
- [ ] Product count is shown.
- [ ] Category visibility clear.

---

## 12. Chats / Conversations

### 12.1 Goal

Chats should feel like a lightweight WhatsApp operations inbox, not a raw message database.

### 12.2 Mobile layout

```txt
1. Inbox summary hero
2. Segments: Open, Waiting, Orders, All
3. Search
4. Conversation list
5. Chat detail sheet/full screen
```

### 12.3 Conversation row

```txt
customer name/phone
last message
time
unread badge
order/status context if exists
source badge
```

### 12.4 Chat detail

Sections:

- Header: customer, phone, linked order.
- Messages: bubbles with time/status.
- Suggested actions: create order, send payment link, follow up, mark resolved.
- Composer if sending supported.

### 12.5 Empty states

```txt
No customer chats yet
Connect WhatsApp or share your store link to start conversations.
[Setup WhatsApp] [Copy store link]
```

### 12.6 Acceptance criteria

- [ ] Inbox list looks good at 375px.
- [ ] Message bubbles readable.
- [ ] Long customer names/phone numbers truncate gracefully.
- [ ] Linked order context obvious.
- [ ] No raw webhook/event JSON visible to seller.

---

## 13. Analytics

### 13.1 Goal

Analytics should be useful for small sellers, not a generic dashboard.

### 13.2 Mobile layout

```txt
1. Period selector
2. Revenue/orders hero
3. Metric cards
4. Best sellers
5. Low-stock impact
6. Payment mix
7. Order source mix
8. Delivery performance
```

### 13.3 Period segmented control

```txt
Today
7D
30D
This month
```

### 13.4 Metric cards

```txt
Sales
Orders
Average order value
Repeat customers
COD pending
Cancelled orders
```

### 13.5 Chart rules

- Cards must have readable titles.
- No microscopic legends.
- Use accessible labels.
- Show empty states if no data.
- Do not show fake charts with fake data unless clearly demo-labeled.

### 13.6 Acceptance criteria

- [ ] Analytics is useful with 0 orders.
- [ ] Analytics is useful with demo/seed data.
- [ ] Charts do not overflow at 375px.
- [ ] Values use rupee formatting.
- [ ] Desktop charts use grid, not stretched mobile stack.

---

## 14. Settings

### 14.1 Goal

Settings should be grouped like an iOS settings app: calm, searchable, understandable.

### 14.2 Groups

```txt
Store profile
Delivery
Payments
WhatsApp automation
Storefront
Notifications
Team/Admin access if present
Plan/Billing if present
Security
Advanced developer settings
```

### 14.3 Settings row anatomy

```txt
left icon squircle
label
short helper
right value/status/chevron/toggle
```

### 14.4 WhatsApp settings

Default view:

```txt
WhatsApp automation
Not connected / Connected / Needs attention
```

Do not show tokens directly unless user opens Advanced.

Advanced section warning:

```txt
Only edit these values if you know your Meta Business setup. Wrong values can stop automated replies.
```

### 14.5 Payment settings

Group:

```txt
Cash on delivery
UPI/manual payment
Razorpay links
Refund/failed payment handling
```

### 14.6 Acceptance criteria

- [ ] Settings not a wall of forms.
- [ ] Advanced technical fields are hidden by default.
- [ ] Save/cancel behavior is clear.
- [ ] Destructive actions have confirmations.
- [ ] iPhone keyboard never hides Save action.

---

## 15. Public Storefront

### 15.1 Files

```txt
app/store/[slug]
app/store/[slug]/StorefrontClient.tsx
components/storefront
```

### 15.2 Goal

The storefront should feel like a real mobile shop page customers can trust.

### 15.3 Customer visual language

Similar tokens, but customer-facing pages should feel simpler and warmer.

Do not show dashboard/admin controls.

### 15.4 Mobile layout

```txt
1. Store header hero
2. Search/category sticky strip
3. Product grid/list
4. Sticky cart bar
5. Cart sheet
6. Checkout sheet
```

### 15.5 Store header

Anatomy:

```txt
store avatar/logo
store name
category/locality
open/closed status
delivery/pickup chips
minimum order / delivery fee summary
```

CTA row:

```txt
Call / WhatsApp / Share
```

### 15.6 Product card

Mobile product row/card:

```txt
image 72×72 squircle
name
unit
price
stock/availability
quantity stepper or Add button
```

Rules:

- Product image optional; placeholder must look nice.
- Out-of-stock state clear but not ugly.
- Long product names wrap to 2 lines max.
- Stepper controls must be 36-40px and easy to tap.

### 15.7 Sticky cart bar

When cart has items:

```txt
3 items · ₹420
View cart
```

Position:

```txt
bottom: calc(env(safe-area-inset-bottom) + 12px)
left/right: 16px
height: 56px
radius: 999px
```

Ensure it does not fight iOS Safari bottom bar.

### 15.8 Cart sheet

Sections:

```txt
Items
Quantity controls
Subtotal
Delivery fee
Total
Checkout button
```

### 15.9 Checkout sheet

Fields:

```txt
Name
Phone
Address / pickup choice
Area/locality
Payment method: COD / UPI / Razorpay if enabled
Order note optional
```

CTA:

```txt
Place order
```

### 15.10 Checkout success

Success page/card:

```txt
Order placed
We sent your order to the store.
Track your order here.
[Track order] [Continue shopping]
```

### 15.11 Empty storefront

```txt
No products available yet
This store is getting set up. Please check again later or contact the seller.
[WhatsApp store]
```

### 15.12 Acceptance criteria

- [ ] Customer storefront looks trustworthy.
- [ ] Product add/remove is one-handed.
- [ ] Cart total always visible when needed.
- [ ] Checkout is not hidden behind keyboard/home indicator.
- [ ] Store closed state is clear.
- [ ] Out-of-stock state is clear.
- [ ] No admin/seller language leaks into customer UI.

---

## 16. Order Tracking

### 16.1 Files

```txt
app/track/[slug]
```

### 16.2 Goal

Tracking should be privacy-safe and reassuring.

### 16.3 Layout

```txt
1. Status hero
2. Order timeline
3. Items summary
4. Payment summary
5. Delivery/pickup info
6. Contact store
```

### 16.4 Status hero examples

Pending:

```txt
Order received
The store is reviewing your order.
```

Preparing:

```txt
Preparing your order
The store has started packing your items.
```

Out for delivery:

```txt
Out for delivery
Your order is on the way.
```

Delivered:

```txt
Delivered
Thanks for ordering.
```

Cancelled:

```txt
Order cancelled
Contact the store if you need help.
```

### 16.5 Timeline

Use vertical stepper with icons:

```txt
Received
Confirmed
Preparing
Ready / Out for delivery
Delivered
```

### 16.6 Privacy rules

- Do not expose internal seller/admin data.
- Do not expose full customer data if not needed.
- Do not expose raw database IDs if not necessary.
- Tracking slug should be enough.

### 16.7 Acceptance criteria

- [ ] Tracking page looks finished.
- [ ] Status timeline is clear.
- [ ] Payment status separate from order status.
- [ ] Works at 320px.
- [ ] Privacy-safe.

---

## 17. Admin Console

### 17.1 Files

```txt
app/admin
components/admin
```

### 17.2 Goal

Admin should feel like the same product family but more data-dense.

### 17.3 Admin shell

Desktop-first but mobile-safe.

Desktop:

- Sidebar.
- Topbar.
- Grid cards.
- Tables with filters.
- Detail drawer.

Mobile:

- Topbar.
- Bottom or More navigation if needed.
- Tables transform into cards.
- Filters in sheet.

### 17.4 Admin overview metrics

```txt
Active sellers
Live orders
GMV
Failed webhooks
WhatsApp issues
Payment issues
New signups
```

### 17.5 Seller list

Card/table fields:

```txt
Store name
Owner
City
Plan
Order count
WhatsApp status
Payment status
Created date
Risk/status
Actions
```

### 17.6 Impersonation banner

When admin is viewing a seller dashboard:

```txt
Admin view: [Store name]
You are viewing this seller workspace. Actions may affect live data.
[Exit view]
```

Visual:

- Orange/amber warning surface.
- Sticky top below topbar.
- Impossible to miss.

### 17.7 Admin action safety

- Impersonation must be signed and expire.
- Destructive actions need confirm dialog.
- Audit log admin actions where possible.
- Do not show raw secrets.

### 17.8 Acceptance criteria

- [ ] Admin is visually aligned with Porter Fresh Ops.
- [ ] Tables are not broken on mobile.
- [ ] Impersonation state is obvious.
- [ ] Admin errors are clear.
- [ ] No dangerous action is one accidental tap.

---

## 18. PWA Experience

### 18.1 Files

```txt
app/layout.tsx
public/manifest.json
public/icon-*.png
public/apple-touch-icon.png
public/sw.js or service-worker files
components/dashboard/PWAInstallBanner.tsx
components/dashboard/PWAUpdateBanner.tsx
components/dashboard/PushPrompt.tsx
app/offline
```

### 18.2 Metadata

Update to light final colors:

```txt
theme color: #fff8ec
background color: #fff8ec
apple status bar: default or black-translucent only if tested
app title: Porter
```

### 18.3 Icons

Create proper generated sizes:

```txt
192×192
512×512
apple-touch-icon 180×180
maskable 192×192
maskable 512×512
favicon
```

Icon style:

- iOS 26 squircle.
- Warm cream background.
- Emerald/saffron Porter mark.
- No tiny unreadable text.
- Looks good on Home Screen.

### 18.4 Splash/launch

Installed PWA launch should not flash black or white randomly.

Match:

```txt
background: #fff8ec
status bar: readable
```

### 18.5 Offline page

Offline page copy:

```txt
You are offline
Porter can show saved screens, but live orders and inventory updates need internet.
[Try again]
```

Include:

- Friendly icon.
- Last synced if available.
- What still works offline.

### 18.6 Install banner

Do not show too early.

Show after:

- Seller has completed onboarding OR visited dashboard twice.
- Browser supports install guidance.

Copy:

```txt
Add Porter to your Home Screen
Open orders faster and keep the dashboard one tap away.
```

### 18.7 Update banner

Copy:

```txt
A new Porter update is ready
Refresh to get the latest fixes.
[Update now]
```

### 18.8 Push prompt

Do not ask immediately on first visit.

Use a soft pre-permission card:

```txt
Get notified about new orders
Porter can alert you when a customer places an order.
[Enable notifications] [Not now]
```

### 18.9 Acceptance criteria

- [ ] Installed PWA header safe area correct.
- [ ] Bottom nav safe area correct.
- [ ] App icon looks premium.
- [ ] Launch background matches app.
- [ ] Offline page polished.
- [ ] Install prompt tasteful.
- [ ] Update prompt not ugly.
- [ ] Push prompt appears at right time.

---

## 19. Marketing / Main App Landing

### 19.1 Goal

The Next.js marketing route should explain Porter simply and drive sellers to sign up/demo.

### 19.2 Hero copy

```txt
Run WhatsApp orders without chaos.
Porter turns chats, store links, inventory, payments, and delivery updates into one calm seller dashboard.
```

CTAs:

```txt
Start free
View demo
```

### 19.3 Sections

```txt
1. Hero
2. How it works: Customer messages -> Porter structures order -> Seller manages delivery
3. Features: Orders, Inventory, WhatsApp, Payments, Tracking
4. Built for Indian/local stores: COD, UPI, Hindi/Gujarati/English flows, local delivery
5. Screenshots/mockups
6. Pricing or early access
7. FAQ
8. Footer
```

### 19.4 Acceptance criteria

- [ ] Marketing page is not generic.
- [ ] Visual style matches dashboard/storefront.
- [ ] CTAs clear.
- [ ] Mobile first.

---

## 20. Legal / Privacy / Terms / Not Found

### 20.1 Legal pages

Privacy/terms should be readable:

```txt
max-width: 760px
line-height: 1.7
section cards optional
sticky back/home link mobile
```

### 20.2 Not found

404 copy:

```txt
Page not found
This Porter link may be old or unavailable.
[Go to dashboard] [Go home]
```

### 20.3 Acceptance criteria

- [ ] Legal pages not raw walls of text.
- [ ] 404 branded and useful.
- [ ] Mobile spacing correct.

---

## 21. File Structure Target

Refactor gradually. Do not create a massive risky rewrite in one commit.

Target:

```txt
components/
  ui/
    AppShell.tsx
    AppTopBar.tsx
    BottomTabBar.tsx
    Sidebar.tsx
    Button.tsx
    IconButton.tsx
    Card.tsx
    HeroCard.tsx
    MetricCard.tsx
    ListRow.tsx
    Field.tsx
    SearchField.tsx
    SegmentedControl.tsx
    Chip.tsx
    StatusBadge.tsx
    PaymentBadge.tsx
    EmptyState.tsx
    ErrorState.tsx
    LoadingState.tsx
    Skeleton.tsx
    Banner.tsx
    Toast.tsx
    BottomSheet.tsx
    Modal.tsx
    Drawer.tsx
    ConfirmDialog.tsx
    StickyActionBar.tsx

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
    OrderDetailSheet.tsx
    OrderStatusStepper.tsx
    OrderQuickActions.tsx
    PaymentBadge.tsx

  inventory/
    ProductCard.tsx
    ProductEditorSheet.tsx
    StockAdjustSheet.tsx
    InventoryHealthCard.tsx
    InventoryLedgerPanel.tsx

  storefront/
    StoreHeader.tsx
    ProductCard.tsx
    CategoryStrip.tsx
    CartBar.tsx
    CartSheet.tsx
    CheckoutSheet.tsx
    StoreEmptyState.tsx

  admin/
    AdminShell.tsx
    AdminMetricCard.tsx
    SellerCard.tsx
    SellerDetailDrawer.tsx
    ImpersonationBanner.tsx
```

---

## 22. CSS/Tailwind Kill List

Search and remove/replace these patterns unless intentionally scoped:

```txt
bg-black
bg-zinc-950
bg-neutral-950
bg-[#0a0f0d]
text-white/70
border-white/10
border-white/15
shadow-[0_0_...]
neon/glow operational cards
rounded-[random]
h-[random] on buttons
text-[10px] for interactive labels unless unavoidable
uppercase long paragraphs
fixed bottom without safe-area
100vh app shell without 100dvh/safe-area handling
overflow-x-auto tables on mobile without card alternative
raw error.message shown to user
```

Allowed exceptions:

- Tiny hidden developer debug tools.
- Intentional dark preview if dark mode later exists.
- Code blocks in docs.

---

## 23. Route-by-Route QA Matrix

For every route, capture screenshots at:

```txt
375px mobile Safari viewport
390px mobile
430px Pro Max
768px iPad portrait
1024px iPad/desktop
```

Routes:

```txt
GitHub Pages static preview
/
/auth/login
/auth/signup
/onboarding
/dashboard
/dashboard/orders
/dashboard/inventory
/dashboard/categories
/dashboard/conversations
/dashboard/analytics
/dashboard/settings
/store/[slug]
/track/[slug]
/admin/login
/admin
/admin/sellers if present
/admin/orders if present
/admin/settings if present
/offline
/privacy
/terms
/not-found
/design-system
```

State screenshots required:

```txt
empty
loading
loaded with demo/seed data
error
mobile keyboard open on forms
sheet open
toast visible
bottom nav visible
installed PWA if possible
```

---

## 24. Accessibility Requirements

### 24.1 Must pass

- Buttons have accessible names.
- Icon-only buttons have `aria-label`.
- Forms have labels.
- Error messages linked to fields.
- Contrast passes WCAG AA for text.
- Focus ring visible.
- Reduced motion supported.
- Drag/drop has non-drag alternative.
- Toasts announced.
- Sheets trap focus and restore focus.
- Escape closes modals/sheets on desktop.
- Touch targets at least 44×44.

### 24.2 Commands/tools

Use available test stack:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

If axe is set up with Playwright, add route checks for primary pages.

---

## 25. Performance Requirements

- Avoid loading heavy chart libraries on routes that do not need charts.
- Use dynamic imports for admin/analytics heavy visuals if needed.
- Product images should have proper sizing and lazy loading.
- Do not block dashboard render on non-critical setup prompts.
- Keep first dashboard interaction fast.
- Use skeletons, not blank waits.
- Avoid excessive backdrop blur on long lists if it hurts mobile performance.

---

## 26. Implementation Phases

## Phase 1 — GitHub Pages launcher fix

Branch: `ui/phase-01-pages-launcher`

Tasks:

1. Redesign `docs/index.html` as premium Porter launcher.
2. Add/replace static CSS for Porter Fresh Ops tokens.
3. Add live URL configured state.
4. Add no-live-URL state.
5. Add iPhone-safe bottom padding.
6. Add product mock preview card.
7. Remove long technical paragraphs above fold.
8. Test on iPhone Safari widths.

Acceptance:

- GitHub Pages no longer looks like a random README.
- It clearly explains preview vs real app.
- Main CTA visible above fold.

## Phase 2 — Tokens and primitives

Branch: `ui/phase-02-tokens-primitives`

Tasks:

1. Consolidate `app/globals.css` tokens.
2. Update Tailwind tokens.
3. Remove decorative dashboard font usage.
4. Add/refactor Button, Card, Field, Badge, Sheet, Toast, EmptyState, LoadingState.
5. Add design-system preview route showing every component and state.

Acceptance:

- New primitives exist.
- Pages can migrate without duplicate styles.
- Design-system page documents variants.

## Phase 3 — App shell/nav/header

Branch: `ui/phase-03-ios-shell`

Tasks:

1. Redesign `ShopDashboardShell`.
2. Redesign `TopBar`.
3. Redesign bottom nav.
4. Redesign More sheet.
5. Redesign notification and profile menus.
6. Add iPad/desktop sidebar behavior.
7. Fix safe area and bottom content padding.

Acceptance:

- Seller dashboard feels native on iPhone.
- iPad/desktop not stretched mobile.

## Phase 4 — Auth/onboarding

Branch: `ui/phase-04-auth-onboarding`

Tasks:

1. Redesign login.
2. Redesign signup.
3. Redesign callback/loading states.
4. Rebuild onboarding as seller-friendly wizard.
5. Hide advanced WhatsApp tokens by default.
6. Add skip/continue path.

Acceptance:

- Seller can reach dashboard without advanced WhatsApp setup.
- Onboarding no longer feels technical/scary.

## Phase 5 — Live orders/dashboard

Branch: `ui/phase-05-live-orders`

Tasks:

1. Redesign dashboard hierarchy.
2. Add urgent action card.
3. Redesign metric cards.
4. Redesign order cards.
5. Redesign order detail sheet/panel.
6. Redesign filters.
7. Preserve realtime/polling/dnd behavior.
8. Add accessible fallback for drag/drop.

Acceptance:

- Mobile orders are action-first.
- Desktop Kanban remains useful.

## Phase 6 — Inventory/categories

Branch: `ui/phase-06-inventory-categories`

Tasks:

1. Redesign inventory page.
2. Product cards.
3. Product editor sheet.
4. Stock adjust sheet.
5. Low-stock states.
6. CSV import/export polish.
7. Redesign categories route.
8. Ensure route works from nav.

Acceptance:

- Inventory usable one-handed.
- Categories complete and polished.

## Phase 7 — Storefront/checkout

Branch: `ui/phase-07-storefront-checkout`

Tasks:

1. Redesign public store header.
2. Product list/grid.
3. Category strip.
4. Sticky cart bar.
5. Cart sheet.
6. Checkout sheet.
7. Success/error states.
8. Store closed/out-of-stock states.

Acceptance:

- Storefront feels like a real customer-facing shop.

## Phase 8 — Tracking

Branch: `ui/phase-08-tracking`

Tasks:

1. Redesign tracking status hero.
2. Timeline stepper.
3. Items/payment/delivery cards.
4. Contact store CTA.
5. Privacy-safe error state.

Acceptance:

- Tracking feels trustworthy and clear.

## Phase 9 — Chats/analytics/settings

Branch: `ui/phase-09-chats-analytics-settings`

Tasks:

1. Redesign conversation inbox.
2. Redesign conversation detail.
3. Redesign analytics dashboard.
4. Redesign settings groups.
5. Hide advanced technical fields.
6. Standardize empty/error/loading states.

Acceptance:

- No remaining seller route looks unfinished.

## Phase 10 — Admin console

Branch: `ui/phase-10-admin-console`

Tasks:

1. Redesign admin shell.
2. Redesign overview metrics.
3. Redesign seller/order lists.
4. Redesign admin detail drawers.
5. Redesign impersonation banner.
6. Make mobile admin usable.

Acceptance:

- Admin aligns visually and is safe.

## Phase 11 — PWA assets/states

Branch: `ui/phase-11-pwa-assets-states`

Tasks:

1. Update manifest colors.
2. Generate proper icons.
3. Fix Apple meta tags.
4. Polish offline page.
5. Polish install prompt.
6. Polish update prompt.
7. Polish push prompt.
8. Test standalone iOS PWA.

Acceptance:

- Installed app feels native and polished.

## Phase 12 — Accessibility, QA, docs

Branch: `ui/phase-12-accessibility-qa`

Tasks:

1. Run all validation commands.
2. Run Playwright mobile screenshot tests if available.
3. Add/refresh screenshot scripts.
4. Run a11y checks.
5. Fix horizontal overflow.
6. Fix touch target failures.
7. Update README and docs.
8. Complete `docs/AGENT_PROGRESS.md` final proof.

Acceptance:

- Every route passes final QA.
- No major UI issue remains.

---

## 27. Final Definition of Done

Porter UI/UX redesign is done only when:

### Visual system

- [ ] Light Porter Fresh Ops design is default.
- [ ] No random dark/neon prototype surfaces remain in primary routes.
- [ ] Cards, buttons, inputs, chips, tabs, sheets, drawers, toasts, skeletons are consistent.
- [ ] iOS 26 squircle radii used consistently.
- [ ] Typography is system-first and readable.

### GitHub Pages

- [ ] Static page is a premium launcher.
- [ ] It does not pretend to be the real app.
- [ ] It has correct CTA based on live URL state.
- [ ] It looks good on iPhone Safari.

### iOS PWA

- [ ] Header safe area correct.
- [ ] Bottom nav safe area correct.
- [ ] Keyboard does not hide active fields/actions.
- [ ] Installed PWA launches with correct colors.
- [ ] Offline, install, update, push states polished.

### Seller flows

- [ ] Auth polished.
- [ ] Onboarding friendly and non-technical.
- [ ] Dashboard action-first.
- [ ] Orders easy to manage.
- [ ] Inventory easy to manage.
- [ ] Categories complete.
- [ ] Chats useful.
- [ ] Analytics understandable.
- [ ] Settings organized.

### Customer flows

- [ ] Storefront feels trustworthy.
- [ ] Cart/checkout one-handed.
- [ ] Tracking privacy-safe and polished.

### Admin

- [ ] Admin aligned with design system.
- [ ] Impersonation obvious and safe.
- [ ] Tables become cards on mobile.

### QA

- [ ] No horizontal overflow at 320/375/390/430.
- [ ] iPad uses desktop/tablet layout.
- [ ] All buttons minimum 44×44.
- [ ] All forms have labels and errors.
- [ ] All icon buttons have labels.
- [ ] Loading/empty/error states exist for every route.
- [ ] `npm ci` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run verify` passes.
- [ ] `npm run test:e2e` passes or documented with true environment blocker.
- [ ] Final screenshots captured.
- [ ] `docs/AGENT_PROGRESS.md` includes proof.

---

## 28. Final Prompt for the Implementation Agent

Use this prompt to start the next coding agent:

```txt
You are working on https://github.com/ruddvz/Porter.

Your task is to complete the Porter iOS 26 pixel-perfect UI/UX redesign using docs/PORTER_IOS26_PIXEL_PERFECT_UI_UX_AGENT_PLAN.md as the source of truth.

Do not stop after one small change. Work phase by phase until every P0/P1 and practical P2 UI/UX item is complete. Do not ask the owner for next steps. Preserve all existing functionality: seller auth, onboarding, dashboard, live orders, order history, inventory, categories, chats, settings, analytics, public storefront, checkout, tracking, admin, WhatsApp, Razorpay, Gemini, Supabase, PWA service workers, install/update/push prompts, and webhooks.

Start with the visible GitHub Pages problem: redesign docs/index.html into a polished Porter launcher so ruddvz.github.io/Porter no longer looks like a random technical README. Then implement the full Porter Fresh Ops iOS 26 design system: warm cream background, white rounded squircle cards, emerald primary actions, saffron accents, Apple-like typography, safe-area-aware shell, floating iPhone bottom nav, desktop/iPad sidebar, polished sheets, cards, forms, badges, empty/loading/error states.

Every route must be checked at 320, 375, 390, 430, 768, 1024, and desktop widths. iPad must use desktop/tablet layout, not stretched phone layout. Update docs/AGENT_PROGRESS.md after every phase with files changed, commands run, screenshots captured, failures, fixes, and remaining tasks.

Run npm ci, npm run lint, npm run typecheck, npm run test, npm run build, npm run verify, and npm run test:e2e as applicable. Only stop for true blockers like missing private credentials, destructive migration approval, or production-only settings.
```
