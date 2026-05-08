# Porter — Pixel-Perfect UI/UX Overhaul Prompt
## Claude Code Master Prompt · WhatsApp Dark Store SaaS

> **Context for Claude Code:** This is the `ruddvz/Porter` repository — a multi-tenant WhatsApp-commerce SaaS where sellers manage inventory, receive orders via the Meta WhatsApp Business API, and collect payments through Razorpay. The stack is Next.js 14 App Router · Supabase (auth + postgres + realtime) · Tailwind CSS · TypeScript · dnd-kit · Recharts · Fuse.js · Web Push · Google Gemini AI.
>
> Your task is a **full UI/UX overhaul**: pixel-perfect styling, real working interactions (no fake/placeholder code), and a polished installable PWA that works identically on mobile and desktop.
>
> **Repo status:** [Plan0-implementation-status.md](Plan0-implementation-status.md) lists what is already built in this codebase vs this spec (git history alone is misleading).

---

## 0 · North Star Design Direction

**Aesthetic:** Industrial-refined dark theme. Think Vercel × Linear × Stripe — sharp edges, generous negative space, one vivid accent (`#25D366` WhatsApp green) on a near-black canvas. No purple gradients. No rounded-everything blob UI. Every component should look like it belongs in a ₹99/month B2B SaaS that a kirana store owner trusts with their livelihood.

**Font stack:**
```css
--font-display: 'DM Mono', monospace;          /* headings, numbers, badges */
--font-body:    'Geist', sans-serif;           /* all body copy */
--font-arabic:  'Noto Naskh Arabic', serif;    /* WhatsApp message previews */
```
Load via `next/font/google` in `app/layout.tsx`.

**Color tokens (add to `tailwind.config.ts` and `:root`):**
```css
:root {
  --bg-base:       #0a0a0a;
  --bg-surface:    #111111;
  --bg-elevated:   #1a1a1a;
  --bg-overlay:    #222222;
  --border:        #2a2a2a;
  --border-strong: #3a3a3a;
  --text-primary:  #f5f5f5;
  --text-secondary:#a0a0a0;
  --text-muted:    #5a5a5a;
  --accent:        #25D366;   /* WhatsApp green */
  --accent-dim:    #128C7E;
  --accent-glow:   rgba(37,211,102,0.12);
  --danger:        #ef4444;
  --warning:       #f59e0b;
  --info:          #3b82f6;
  --radius-sm:     4px;
  --radius-md:     8px;
  --radius-lg:     12px;
}
```

---

## 1 · Project-Wide Changes (Apply First)

### 1.1 PWA Manifest & Service Worker

**Create `public/manifest.json`:**
```json
{
  "name": "Porter — WhatsApp Commerce",
  "short_name": "Porter",
  "description": "Manage your WhatsApp dark store",
  "start_url": "/dashboard",
  "display": "standalone",
  "display_override": ["window-controls-overlay"],
  "background_color": "#0a0a0a",
  "theme_color": "#25D366",
  "orientation": "any",
  "categories": ["business", "productivity"],
  "icons": [
    { "src": "/icons/icon-72.png",  "sizes": "72x72",   "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-96.png",  "sizes": "96x96",   "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "shortcuts": [
    { "name": "Orders",    "url": "/dashboard/orders",    "icons": [{ "src": "/icons/shortcut-orders.png",    "sizes": "96x96" }] },
    { "name": "Products",  "url": "/dashboard/products",  "icons": [{ "src": "/icons/shortcut-products.png",  "sizes": "96x96" }] },
    { "name": "Analytics", "url": "/dashboard/analytics", "icons": [{ "src": "/icons/shortcut-analytics.png", "sizes": "96x96" }] }
  ],
  "screenshots": [
    { "src": "/screenshots/desktop.png", "sizes": "1280x800", "type": "image/png", "form_factor": "wide"   },
    { "src": "/screenshots/mobile.png",  "sizes": "390x844",  "type": "image/png", "form_factor": "narrow" }
  ]
}
```

**Create `public/sw.js` (real service worker — NOT fake):**
```js
const CACHE_NAME = 'porter-v1';
const STATIC_ASSETS = ['/', '/dashboard', '/offline'];

// Install: pre-cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: purge old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) return;

  // API / webhook → network only
  if (url.pathname.startsWith('/api/')) return;

  // Static assets → cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    e.respondWith(
      caches.match(request).then(r => r || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Pages → network-first, fallback to cache, then /offline
  e.respondWith(
    fetch(request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      })
      .catch(() => caches.match(request).then(r => r || caches.match('/offline')))
  );
});

// Push notifications (real Web Push)
self.addEventListener('push', e => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'Porter', {
      body: data.body ?? 'You have a new notification',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url ?? '/dashboard/orders' },
      actions: [
        { action: 'view', title: 'View Order' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      vibrate: [100, 50, 100],
      tag: data.tag ?? 'porter-notification',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const target = e.notification.data?.url ?? '/dashboard';
      const existing = cs.find(c => c.url.includes(target));
      if (existing) return existing.focus();
      return clients.openWindow(target);
    })
  );
});
```

**Register SW in `app/layout.tsx`:**
```tsx
// Add inside <body> at the bottom:
<Script id="sw-register" strategy="afterInteractive">{`
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(r => console.log('[SW] registered', r.scope))
      .catch(e => console.error('[SW] registration failed', e));
  }
`}</Script>
```

**Add to `<head>` in `app/layout.tsx`:**
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#25D366" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Porter" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="application-name" content="Porter" />
```

**Create `app/offline/page.tsx`:**
```tsx
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[--bg-base] flex flex-col items-center justify-center gap-4 text-[--text-secondary]">
      <div className="w-16 h-16 rounded-full bg-[--bg-elevated] flex items-center justify-center">
        <WifiOff className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-mono text-[--text-primary]">You're offline</h1>
      <p className="text-sm text-center max-w-xs">Porter needs a connection to sync orders. Check your network and try again.</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[--accent] text-black text-sm font-mono rounded-[--radius-sm] hover:bg-[--accent-dim] transition-colors">
        Retry
      </button>
    </div>
  );
}
```

---

### 1.2 Global Layout (`app/layout.tsx`)

Complete replacement:
```tsx
import type { Metadata, Viewport } from 'next';
import { DM_Mono, Geist } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-body' });
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-display' });

export const metadata: Metadata = {
  title: { default: 'Porter', template: '%s · Porter' },
  description: 'WhatsApp dark store management platform',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Porter' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,     // prevents iOS double-tap zoom breaking layout
  userScalable: false,
  themeColor: '#25D366',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${dmMono.variable}`}>
      <head />
      <body className="bg-[--bg-base] text-[--text-primary] antialiased overflow-x-hidden">
        {children}
        <Script id="sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
        `}</Script>
      </body>
    </html>
  );
}
```

### 1.3 Global CSS (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base:       #0a0a0a;
  --bg-surface:    #111111;
  --bg-elevated:   #1a1a1a;
  --bg-overlay:    #222222;
  --border:        #2a2a2a;
  --border-strong: #3a3a3a;
  --text-primary:  #f5f5f5;
  --text-secondary:#a0a0a0;
  --text-muted:    #5a5a5a;
  --accent:        #25D366;
  --accent-dim:    #128C7E;
  --accent-glow:   rgba(37,211,102,0.12);
  --danger:        #ef4444;
  --warning:       #f59e0b;
  --info:          #3b82f6;
  --radius-sm:     4px;
  --radius-md:     8px;
  --radius-lg:     12px;
  --font-body:     var(--font-body, 'Geist', sans-serif);
  --font-display:  var(--font-display, 'DM Mono', monospace);

  /* Safe area insets for PWA notch/home-indicator */
  --sat: env(safe-area-inset-top);
  --sar: env(safe-area-inset-right);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
}

@layer base {
  * { box-sizing: border-box; }
  
  body {
    font-family: var(--font-body);
    background: var(--bg-base);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    /* PWA: prevent overscroll bounce revealing white background */
    overscroll-behavior: none;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg-base); }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

  /* Focus ring */
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* Selection */
  ::selection { background: var(--accent-glow); color: var(--accent); }
}

@layer components {
  /* ── Button primitives ── */
  .btn {
    @apply inline-flex items-center justify-center gap-2 font-mono text-sm px-4 py-2 rounded-[--radius-sm] transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed;
    -webkit-tap-highlight-color: transparent;
  }
  .btn-primary {
    @apply btn bg-[--accent] text-black hover:bg-[--accent-dim] active:scale-[0.98] font-medium;
  }
  .btn-ghost {
    @apply btn bg-transparent text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text-primary] border border-[--border];
  }
  .btn-danger {
    @apply btn bg-[--danger]/10 text-[--danger] hover:bg-[--danger]/20 border border-[--danger]/20;
  }
  .btn-icon {
    @apply btn w-9 h-9 p-0 bg-[--bg-elevated] text-[--text-secondary] hover:text-[--text-primary] border border-[--border];
  }

  /* ── Card ── */
  .card {
    @apply bg-[--bg-surface] border border-[--border] rounded-[--radius-lg] overflow-hidden;
  }
  .card-hoverable {
    @apply card hover:border-[--border-strong] transition-all duration-150;
  }

  /* ── Input ── */
  .input {
    @apply w-full bg-[--bg-elevated] border border-[--border] rounded-[--radius-sm] px-3 py-2 text-sm text-[--text-primary] placeholder:text-[--text-muted] focus:outline-none focus:border-[--accent] focus:ring-1 focus:ring-[--accent]/30 transition-all duration-150;
  }
  .input-label {
    @apply block text-xs font-mono text-[--text-muted] uppercase tracking-wider mb-1.5;
  }

  /* ── Badge ── */
  .badge {
    @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-[--radius-sm] text-xs font-mono;
  }
  .badge-green  { @apply badge bg-[--accent]/10 text-[--accent]; }
  .badge-yellow { @apply badge bg-[--warning]/10 text-[--warning]; }
  .badge-red    { @apply badge bg-[--danger]/10 text-[--danger]; }
  .badge-blue   { @apply badge bg-[--info]/10 text-[--info]; }
  .badge-muted  { @apply badge bg-[--bg-overlay] text-[--text-muted]; }

  /* ── Stat tile ── */
  .stat-tile {
    @apply card p-4 flex flex-col gap-1;
  }
  .stat-value {
    @apply text-2xl font-mono text-[--text-primary] tabular-nums;
  }
  .stat-label {
    @apply text-xs text-[--text-muted] uppercase tracking-wider font-mono;
  }

  /* ── Table ── */
  .data-table { @apply w-full text-sm; }
  .data-table thead th {
    @apply text-left text-xs font-mono text-[--text-muted] uppercase tracking-wider py-3 px-4 border-b border-[--border] bg-[--bg-surface];
  }
  .data-table tbody tr {
    @apply border-b border-[--border] hover:bg-[--bg-elevated] transition-colors;
  }
  .data-table tbody td {
    @apply py-3 px-4 text-[--text-secondary];
  }

  /* ── Skeleton loader ── */
  .skeleton {
    @apply bg-[--bg-elevated] rounded animate-pulse;
    background: linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── PWA safe area padding ── */
  .safe-top    { padding-top: env(safe-area-inset-top); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
  .safe-left   { padding-left: env(safe-area-inset-left); }
  .safe-right  { padding-right: env(safe-area-inset-right); }
}
```

---

## 2 · Authentication Pages

### `/auth/login` & `/auth/signup`

**Layout:** Full viewport split — left 40% brand panel (dark, accent green), right 60% form. On mobile collapse to single-column with form only, brand becomes a top bar.

**Brand panel content:**
- Porter logo (P monogram in `--accent`) + wordmark in DM Mono
- WhatsApp commerce tagline: `"Your store. Every WhatsApp. Zero friction."`
- Three micro feature pills: `📦 Inventory` · `💬 WhatsApp Orders` · `💳 Razorpay Payments`
- Subtle animated grid background (CSS `background-image: linear-gradient` grid lines at 1px, very low opacity)

**Form requirements (REAL — no fake submissions):**
- Email + password fields with real Supabase auth calls using `@supabase/ssr` client
- Inline validation: red border + error message below field on blur
- Loading state: disable button, show spinner (inline SVG spin, not a library component)
- On signup: redirect to `/onboarding` after email confirmation check
- On login: redirect to `?next` param or `/dashboard`
- Google OAuth button: `signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })` — MUST work
- "Forgot password" flow: `supabase.auth.resetPasswordForEmail(email)` with toast confirmation
- Error handling for: invalid credentials, email not confirmed, network errors — all shown inline

**Mobile-specific:** stack form inputs to full width, 44px tap target height on all inputs and buttons, no horizontal overflow.

---

## 3 · Dashboard Shell (`/dashboard`)

### 3.1 Sidebar Navigation (Desktop ≥ 768px)

```
Width: 220px fixed left, full height, bg-[--bg-surface], border-r border-[--border]
Pinned to left in PWA window-controls-overlay mode
```

**Structure:**
```
┌──────────────────────┐
│  ◉ Porter     [≡]   │  ← logo + collapse toggle
├──────────────────────┤
│  📊 Dashboard        │
│  📦 Products         │
│  🛒 Orders      [3]  │  ← live unread badge (real Supabase realtime)
│  💬 Conversations    │
│  📈 Analytics        │
│  ⚙️  Settings        │
├──────────────────────┤
│  🔔 Push Setup       │  ← only if push not yet granted
├──────────────────────┤
│  [Avatar] Seller     │  ← bottom, seller name + plan badge
│  ruddvz@...          │
│  [Pro] [Logout]      │
└──────────────────────┘
```

**Active state:** Left 2px `--accent` border on nav item + `bg-[--bg-elevated]` + `text-[--accent]`

**Orders badge:** Subscribe to Supabase realtime on `orders` table, filter `seller_id = currentUser`, count `status = 'new'`. Update badge live — this must be a real realtime subscription.

### 3.2 Mobile Bottom Navigation (< 768px)

```
Position: fixed bottom-0, full width, bg-[--bg-surface], border-t border-[--border]
Height: 56px + env(safe-area-inset-bottom)
Items: Dashboard · Orders · Products · Chats · Settings
```

Each tab: icon (24px) + label (10px font-mono), active = `--accent` color with subtle glow dot.

**PWA standalone detection:**
```ts
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                  || window.navigator.standalone === true;
// If standalone, add extra bottom safe area padding (home indicator)
```

### 3.3 Top Bar (Mobile only)

```
Height: 56px + safe-area-inset-top
Content: [Hamburger? No — use bottom nav] | "Porter" wordmark center | [Bell icon] [Avatar]
bg-[--bg-surface] border-b border-[--border]
```

The Bell icon: show real unread count from `order_events` or push notifications table. On click, open a slide-down notification drawer.

---

## 4 · Dashboard Home (`/dashboard/page.tsx`)

### Layout (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│  Good morning, {name} 👋                [Today ▾]       │
│  {date} — {store_name}                                   │
├──────────┬──────────┬──────────┬──────────┐             │
│  ₹48,200 │    127   │   18 🔴  │   94%    │             │
│  Revenue  │  Orders  │  Pending │ Fulfillmt │             │
├──────────┴──────────┴──────────┴──────────┘             │
│                                                         │
│  [Orders Trend — Recharts AreaChart, real data]         │
│                                                         │
├────────────────────────┬────────────────────────────────┤
│  Recent Orders         │  Low Stock Alerts              │
│  (last 10, live RT)    │  (qty < min_qty, real query)   │
└────────────────────────┴────────────────────────────────┘
```

**All numbers are REAL — fetched from Supabase, not hardcoded.**

**Revenue card:** `SELECT SUM(total) FROM orders WHERE seller_id = $1 AND created_at >= $2`

**Realtime Orders table:**
```ts
const channel = supabase.channel('dashboard-orders')
  .on('postgres_changes', {
    event: '*', schema: 'public', table: 'orders',
    filter: `seller_id=eq.${sellerId}`
  }, payload => {
    // update local state — add/update/remove order in list
    setOrders(prev => upsertOrder(prev, payload));
  })
  .subscribe();
```

**Mobile layout:** Stats in 2×2 grid, chart below, then lists stacked full-width.

---

## 5 · Products Page (`/dashboard/products`)

### 5.1 Header Bar
```
[+ Add Product]  [Search…]  [Filter ▾]  [Sort ▾]  [Grid|List toggle]
```

**Search:** Fuse.js client-side fuzzy search on name + SKU (the library is already in dependencies — USE IT). Debounce 200ms.

**Filter dropdown:** by category, stock status (in stock / low / out), price range. All purely client-side filtering on the fetched product list.

### 5.2 Product Grid (default view)
Each card: product image (with `next/image` + blur placeholder) · name · SKU badge · price · stock level pill.

Stock pill logic:
- `qty >= min_qty * 2` → `badge-green "In Stock"`
- `qty > 0 && qty < min_qty * 2` → `badge-yellow "Low Stock"`  
- `qty === 0` → `badge-red "Out of Stock"`

**Click card → slide-over panel** (not a new page — right-side drawer, 480px wide on desktop, full-screen on mobile) with full product edit form. All edits go to `supabase.from('products').update(...)` with optimistic UI update.

### 5.3 Add Product Modal
Real form with:
- Product name (required)
- SKU (auto-generated if blank: `PRD-{nanoid(6).toUpperCase()}`)
- Description
- Price (₹) with formatting
- Quantity + Min Quantity
- Category (text input + datalist from existing categories)
- Image upload: use Supabase Storage (`/product-images/{sellerId}/{filename}`). Show upload progress bar. Preview image after upload. Compress before upload using canvas API.
- Active toggle (available on WhatsApp bot)
- Submit calls `supabase.from('products').insert(...)`, closes modal, adds to list

### 5.4 Drag-to-Reorder (List view)
The repo already has `@dnd-kit` installed. Implement `DndContext` + `SortableContext` for product list reorder. On drag end, update `sort_order` column in Supabase via batch update. Add `sort_order int DEFAULT 0` if migration hasn't been applied yet — provide the SQL.

---

## 6 · Orders Page (`/dashboard/orders`)

### 6.1 Kanban View (default)
Four columns: `New` · `Preparing` · `Ready` · `Delivered` (+ `Cancelled` as collapsed accordion)

Each column: scrollable, max-height calc(100vh - 160px), custom thin scrollbar.

Order card contains:
- Order ID (`#ORD-{short_id}`) in DM Mono
- Customer WhatsApp name + number (masked: `+91 98••••5432`)
- Time ago (live-updating: "2m ago")
- Total amount
- Item count + item name preview
- Status badge
- Quick action button: `[→ Mark Preparing]` / `[→ Ready]` / `[→ Delivered]`

**Drag between columns:** Use dnd-kit. On drop, call `supabase.from('orders').update({ status: newStatus, ...})`. Optimistic update.

**Realtime:** New orders animate in from the top of the `New` column with a subtle slide-down + green flash on the card border. Use CSS keyframe:
```css
@keyframes order-arrival {
  0%  { transform: translateY(-12px); opacity: 0; border-color: var(--accent); }
  60% { border-color: var(--accent); }
  100% { transform: translateY(0); opacity: 1; border-color: var(--border); }
}
```

### 6.2 Order Detail Panel (right-side drawer)
Click any card → opens 520px drawer (full screen on mobile) with:
- Full customer info
- All order items with images, qty, price
- Order timeline (from `order_events` table — REAL data)
- Payment status badge (Razorpay payment_id if paid)
- WhatsApp conversation link (`https://wa.me/{phone}`)
- Manual status override dropdown
- Add note → inserts into `order_events`

### 6.3 Table View (toggle)
Standard sortable table with all orders. Columns: ID · Customer · Items · Total · Status · Created · Actions. Pagination: 25 per page, cursor-based (`created_at DESC` + `id` for stable pagination).

---

## 7 · Conversations Page (`/dashboard/conversations`)

**Layout:** WhatsApp-style split:
- Left: 360px conversation list (scrollable)
- Right: message thread + reply box

**Conversation list item:**
- Contact avatar (initials fallback, green background)
- Contact name + phone
- Last message preview (truncated 60 chars, right-to-left aware)
- Timestamp (today: time; older: date)
- Unread count badge

**Message thread:**
- Incoming (left): dark bubble `bg-[--bg-elevated]`, user name header
- Outgoing (right): `bg-[--accent]/10` border `border-[--accent]/20`
- System messages: centered, muted text, "Order #123 confirmed"
- Timestamps per message in DM Mono 10px

**Reply box:**
- Textarea with auto-resize (min 1 line, max 4)
- Send button (Paper Plane icon) — calls WhatsApp Send Message API via your existing `/api/webhook/whatsapp` route or a new `/api/wa/send` endpoint
- Quick reply chips above textarea: `"Your order is ready ✅"` · `"Out of delivery area"` · `"What's your address?"`

**This must call the real WhatsApp API.** Create `app/api/wa/send/route.ts`:
```ts
// POST /api/wa/send
// body: { to: string, message: string, sellerId: string }
// Fetch seller's wa_token from sellers table (server-side only)
// Call https://graph.facebook.com/v19.0/{phoneNumberId}/messages
// Log to order_events
```

---

## 8 · Analytics Page (`/dashboard/analytics`)

All charts use Recharts (already installed). All data is REAL (Supabase queries).

**Date range picker:** Last 7d · 30d · 90d · Custom (date inputs). Changes all charts simultaneously.

### Charts:
1. **Revenue over time** — `AreaChart` with gradient fill, `--accent` stroke
2. **Orders by status** — `BarChart` grouped
3. **Top products by revenue** — `BarChart` horizontal with product names
4. **Order volume by hour of day** — `BarChart` (detect peak WhatsApp hours)
5. **Customer retention** — `LineChart` new vs returning (count distinct phone numbers)

**All queries use Supabase RPC functions** (write the SQL in a migration if not present). Example:
```sql
CREATE OR REPLACE FUNCTION get_revenue_timeseries(p_seller_id uuid, p_start date, p_end date)
RETURNS TABLE (date date, revenue numeric, order_count int) AS $$
  SELECT DATE(created_at) as date, SUM(total), COUNT(*)
  FROM orders
  WHERE seller_id = p_seller_id AND created_at BETWEEN p_start AND p_end
  GROUP BY DATE(created_at) ORDER BY date;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

**Export button:** Download CSV of any chart's data. Client-side CSV generation using Blob + URL.createObjectURL.

---

## 9 · Settings Page (`/dashboard/settings`)

Tabbed layout: `Store` · `WhatsApp` · `Payments` · `Notifications` · `Danger`

### Tab: Store
- Store name, description, logo upload (Supabase Storage)
- Timezone selector (real IANA timezone list, grouped by continent)
- Minimum order amount (₹)
- Delivery fee (₹ or "Free")
- Off-hours message (textarea, what to send when shop is closed)
- Operating hours: per-day toggles + time pickers

### Tab: WhatsApp
- Phone Number ID (masked input, show/hide toggle)
- Access Token (masked, encrypted at rest via `PORTER_CREDENTIAL_SECRET`)
- Webhook URL display (copy button → `navigator.clipboard.writeText`)
- Test connection button: calls your server action to send a test message to the seller's own number
- Meta App ID

### Tab: Payments
- Razorpay Key ID + Secret (masked, encrypted)
- Test Razorpay webhook button
- Payment link prefix

### Tab: Notifications
**This section MUST BE REAL, not fake.**

PWA Push notification setup:
```tsx
async function subscribeToPush() {
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) { setStatus('subscribed'); return; }
  
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
  });
  
  // Save to Supabase push_subscriptions table
  await supabase.from('push_subscriptions').upsert({
    seller_id: sellerId,
    endpoint: sub.endpoint,
    p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
    auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
  });
  setStatus('subscribed');
}
```

Show: permission state indicator, device list, test notification button.

### Tab: Danger
- Delete all products (with confirmation dialog)  
- Reset WhatsApp settings
- Delete account (full wipe: calls server action that deletes seller + cascade, then `supabase.auth.signOut()`)

---

## 10 · Onboarding Flow (`/onboarding`)

Multi-step wizard with progress bar:

```
Step 1/4: Store Details    → name, description, logo
Step 2/4: WhatsApp Setup   → phone number ID, access token + live verify button
Step 3/4: First Product    → add at least one product to continue
Step 4/4: Launch!          → test bot link, share WhatsApp link, confetti animation
```

**Step 2 verify button:** Makes real API call to test WhatsApp credentials before allowing Next. Shows success/failure inline.

**Confetti (Step 4):** Use `canvas-confetti` (add to dependencies) with `--accent` green and white colors.

**Progress persistence:** Save `onboarding_step` to Supabase `sellers` table. If user refreshes, resume from current step.

---

## 11 · Admin Panel (`/admin`)

### 11.1 Admin Login (`/admin/login`)
Same auth UI as seller login but with distinct branding: "Porter Platform Admin" with shield icon. Same real Supabase auth + `is_platform_admin()` RPC check.

### 11.2 Admin Dashboard
**Metrics (real queries across all sellers):**
- Total sellers (active / pending / churned)
- Platform GMV (sum of all orders.total)
- Today's order volume
- Active WhatsApp bots (sellers with valid credentials)
- Live event feed (from `platform_events` realtime table)

### 11.3 Sellers Table
Full searchable/filterable table. Click row → seller detail modal with:
- All seller info
- Order history graph (mini Recharts line)
- Impersonate button (admin can view seller dashboard AS that seller)
- Suspend / Reactivate toggle
- Edit plan/subscription

### 11.4 Live Event Feed
Subscribe to `platform_events` realtime channel. Display as activity log:
```
🟢 12:04:02  New order #847 — Rahul's Kirana (₹340)
🔵 12:03:45  Seller onboarded — Fresh Bakes Delhi
🔴 12:01:12  Payment failed — order #841 (₹180)
```
Auto-scroll to bottom when new events arrive (only if already at bottom — detect scroll position).

---

## 12 · Order Tracking Page (`/track/[orderId]`)

**Public page — no auth required.**

Minimal, mobile-first design. Customer scans QR or clicks link.

```
┌─────────────────────────┐
│  🟢 Porter              │
│  Your order from        │
│  {store_name}           │
├─────────────────────────┤
│  Order #ORD-ABC123      │
│                         │
│  ●━━━━━━━━━━━━━━━○ ○ ○  │
│  Confirmed  Prep  Ready │
│                         │
│  Items:                 │
│  • 2× Toor Dal 1kg      │
│  • 1× Basmati Rice 5kg  │
│                         │
│  Total: ₹ 680           │
│  Payment: Paid ✅        │
├─────────────────────────┤
│  [Open in WhatsApp]     │
└─────────────────────────┘
```

**Status auto-updates:** Poll every 15 seconds via `fetch('/api/track/{orderId}')` (create this API route). Or use Supabase realtime with anon key (only SELECT on orders, RLS: order is readable by anyone who knows the ID — add `USING (true)` to the tracking-specific policy).

**The status stepper must animate:** when status changes, the filled dot slides to the new position with CSS transition.

---

## 13 · Component Library (`components/`)

Audit every existing component and upgrade:

### `components/ui/` — Create these shared primitives:

**`Button.tsx`** — wraps `<button>` with all variants: `primary`, `ghost`, `danger`, `icon`. Includes loading state with inline spinner.

**`Input.tsx`** — styled input + label + error message. Handles `type="password"` with show/hide toggle.

**`Modal.tsx`** — uses `createPortal` to `document.body`. Backdrop blur `backdrop-blur-sm bg-black/60`. Slide-up animation on mobile, fade-scale on desktop. Traps focus (real a11y). Closes on Escape key.

**`Drawer.tsx`** — right-side panel (desktop) or bottom sheet (mobile). Bottom sheet: drag handle at top, swipe-to-close gesture using `touch-action: none` + pointer events tracking.

**`Toast.tsx`** — lightweight toast system. No library. Uses `useState` + `useEffect` with timeout. Stack multiple toasts. Auto-dismiss 4s. Types: success (green), error (red), info (blue).

**`Skeleton.tsx`** — renders shimmer placeholder matching the shape of the content it replaces. Props: `lines`, `width`, `height`, `circle`.

**`EmptyState.tsx`** — icon + heading + subtext + optional CTA button. Used for empty products list, empty orders, etc.

**`ConfirmDialog.tsx`** — "Are you sure?" modal with async confirm handler. Used before deletes and dangerous actions.

---

## 14 · PWA Install Prompt

**Create `components/PWAInstallBanner.tsx`:**

```tsx
'use client';
import { useEffect, useState } from 'react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed and not dismissed before
      if (!localStorage.getItem('pwa-dismissed')) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    localStorage.setItem('pwa-dismissed', '1');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom))] md:bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 card border-[--accent]/30 p-4 shadow-xl shadow-black/40">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-[--radius-md] bg-[--accent] flex items-center justify-center shrink-0">
          <span className="text-black text-lg font-mono font-bold">P</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono text-[--text-primary]">Install Porter</p>
          <p className="text-xs text-[--text-muted] mt-0.5">Add to home screen for instant access and push notifications</p>
        </div>
        <button onClick={dismiss} className="text-[--text-muted] hover:text-[--text-primary]">✕</button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={install} className="btn-primary flex-1 text-xs">Install App</button>
        <button onClick={dismiss} className="btn-ghost flex-1 text-xs">Not now</button>
      </div>
    </div>
  );
}
```

Add `<PWAInstallBanner />` to the dashboard layout.

---

## 15 · Responsive Breakpoints Reference

| Breakpoint | Width    | Layout                                      |
|------------|----------|---------------------------------------------|
| Mobile     | < 640px  | Bottom nav · single column · full-width panels |
| Tablet     | 640–1024 | Bottom nav · 2-col grids · drawer panels     |
| Desktop    | > 1024px | Sidebar nav · multi-col · right drawers       |
| PWA mobile | standalone | +safe-area padding · no URL bar deduction  |
| PWA desktop| standalone | +window-controls-overlay titlebar         |

**No content should overflow horizontally at any breakpoint.** Test at 320px (iPhone SE), 390px (iPhone 15), 430px (Pro Max), 768px (iPad), 1280px (laptop), 1920px (desktop).

---

## 16 · Performance Requirements

- **LCP < 2.5s** on 4G mobile
- **No layout shifts (CLS = 0):** Always specify `width`/`height` on `<Image>` components; always reserve space for async content with skeleton loaders
- **No fake loading states:** Every spinner must correspond to a real async operation
- **Suspense boundaries:** Every page that fetches data server-side wraps async content in `<Suspense fallback={<PageSkeleton />}>`
- **Optimistic updates everywhere:** Don't wait for server response to update UI for status changes, product edits, etc. Roll back on error with toast
- **Prefetch links:** Use `<Link prefetch>` on all nav items

---

## 17 · Accessibility

- All interactive elements: min 44×44px touch target (WCAG 2.1 AA)
- All icon-only buttons have `aria-label`
- All modals trap focus and restore focus on close
- Form errors announced to screen readers via `aria-live="polite"` + `aria-describedby`
- Color is never the only way to convey status (always include text/icon)
- Skip-to-content link at `<body>` start for keyboard users
- All images have meaningful `alt` text; decorative images use `alt=""`

---

## 18 · Error Handling Patterns

**Every Supabase call must be wrapped:**
```ts
const { data, error } = await supabase.from('products').select('*');
if (error) {
  console.error('[products/fetch]', error);
  throw new Error(error.message); // or return { error }
}
```

**API routes return consistent shape:**
```ts
// Success:  { data: T, error: null }
// Failure:  { data: null, error: { message: string, code?: string } }
```

**Unhandled rejections:** Add `window.addEventListener('unhandledrejection', ...)` in layout to show a generic error toast rather than crashing silently.

---

## 19 · Security Checklist

- [ ] All Supabase queries use RLS policies — never bypass with service role key client-side
- [ ] WhatsApp + Razorpay credentials stored server-side only, never in `NEXT_PUBLIC_*`
- [ ] Webhook endpoints verify signatures (Meta X-Hub-Signature-256, Razorpay X-Razorpay-Signature)
- [ ] Admin routes double-check `is_platform_admin()` server-side even if middleware also does
- [ ] File uploads validate MIME type and size server-side before Supabase Storage
- [ ] Rate-limit auth endpoints (Supabase built-in + Vercel edge rate limiting)

---

## 20 · File Structure After Overhaul

```
├── app/
│   ├── layout.tsx                    # Root layout + SW registration
│   ├── globals.css                   # Design tokens + component classes
│   ├── offline/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── callback/route.ts         # OAuth callback
│   │   └── reset-password/page.tsx
│   ├── onboarding/page.tsx           # Multi-step wizard
│   ├── dashboard/
│   │   ├── layout.tsx                # Sidebar + bottom nav
│   │   ├── page.tsx                  # Home/overview
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── conversations/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── page.tsx
│   ├── track/[orderId]/page.tsx
│   └── api/
│       ├── webhook/whatsapp/route.ts
│       ├── webhook/razorpay/route.ts
│       ├── wa/send/route.ts          # NEW: send WhatsApp message
│       ├── push/subscribe/route.ts   # NEW: save push subscription
│       ├── push/send/route.ts        # NEW: trigger push notification
│       ├── track/[orderId]/route.ts  # NEW: public order status
│       └── cron/nudge-abandoned/route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── Toast.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── ConfirmDialog.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── TopBar.tsx
│   │   ├── StatTile.tsx
│   │   └── NotificationDrawer.tsx
│   ├── products/
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDrawer.tsx
│   │   └── AddProductModal.tsx
│   ├── orders/
│   │   ├── KanbanBoard.tsx
│   │   ├── OrderCard.tsx
│   │   ├── OrderDrawer.tsx
│   │   └── OrderTable.tsx
│   ├── conversations/
│   │   ├── ConversationList.tsx
│   │   └── MessageThread.tsx
│   ├── analytics/
│   │   └── Charts.tsx
│   └── PWAInstallBanner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client (cookies)
│   │   └── middleware.ts
│   ├── whatsapp.ts                 # WA API helpers
│   ├── razorpay.ts
│   ├── push.ts                     # web-push helpers
│   └── utils.ts
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── offline.html                # Fallback for SW
│   └── icons/
│       ├── icon-72.png … icon-512.png
│       └── badge-72.png
├── supabase/migrations/
│   └── [all existing migrations]
└── types/
    └── database.ts                 # Generated Supabase types
```

---

## 21 · Migration SQL (add if missing)

```sql
-- Ensure push_subscriptions table exists
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id   uuid REFERENCES public.sellers(id) ON DELETE CASCADE,
  endpoint    text NOT NULL,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(seller_id, endpoint)
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_own" ON public.push_subscriptions
  USING (seller_id = (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Ensure platform_events realtime table
CREATE TABLE IF NOT EXISTS public.platform_events (
  id         bigserial PRIMARY KEY,
  type       text NOT NULL,
  seller_id  uuid,
  payload    jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_events;

-- Ensure products have sort_order
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

-- Revenue timeseries RPC
CREATE OR REPLACE FUNCTION get_revenue_timeseries(
  p_seller_id uuid, p_start date, p_end date
) RETURNS TABLE (date date, revenue numeric, order_count bigint) AS $$
  SELECT DATE(created_at), SUM(total), COUNT(*)
  FROM orders
  WHERE seller_id = p_seller_id
    AND status != 'cancelled'
    AND created_at::date BETWEEN p_start AND p_end
  GROUP BY DATE(created_at)
  ORDER BY date;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 22 · Implementation Order (Priority Queue)

Execute in this exact order for fastest visible progress:

1. **`globals.css` design tokens + Tailwind config** — foundation everything else builds on
2. **Root `layout.tsx`** — fonts, manifest link, SW registration
3. **`public/manifest.json` + `public/sw.js`** — makes it installable immediately
4. **`public/icons/`** — generate all icon sizes (use a favicon generator or canvas script)
5. **Shared UI components** (Button, Input, Modal, Drawer, Toast, Skeleton) — used everywhere
6. **Dashboard layout** (Sidebar + BottomNav + TopBar) — frame for all pages
7. **Dashboard Home** — stats + realtime
8. **Products page** — highest seller daily-driver usage
9. **Orders page** — most critical business flow
10. **Auth pages** — polish login/signup
11. **Conversations page**
12. **Analytics page**
13. **Settings page** (all tabs)
14. **Onboarding flow**
15. **Admin panel**
16. **Order tracking page** (public)
17. **PWA install banner**
18. **Accessibility audit + WCAG fixes**
19. **Performance audit** (Lighthouse, fix anything < 90)
20. **Final cross-device QA** (iOS Safari, Android Chrome, Desktop Chrome/Firefox/Safari)

---

## 23 · QA Checklist Before Shipping

### Mobile PWA (iPhone + Android)
- [ ] Add to Home Screen works (standalone mode, no address bar)
- [ ] Splash screen shows on launch
- [ ] Push notifications arrive when app is closed
- [ ] Bottom nav doesn't overlap with phone home indicator (safe area)
- [ ] No horizontal scroll on any page at 320px
- [ ] Tap targets all ≥ 44px
- [ ] Modals/drawers scroll independently, don't break page scroll
- [ ] Images load with blur-up placeholder, not layout shift
- [ ] Offline page shows when network disconnected
- [ ] Returning to app from background refreshes data within 2s

### Desktop PWA
- [ ] Install prompt appears in Chrome/Edge address bar
- [ ] Window-controls-overlay titlebar shows correctly
- [ ] Sidebar navigation fully visible, no overlap with WCO
- [ ] Keyboard navigation works throughout (Tab, Enter, Escape, Arrow keys)
- [ ] All drawers open/close with keyboard

### Functional
- [ ] Login with email + password: real Supabase auth
- [ ] Login with Google OAuth: real redirect flow
- [ ] Reset password email sent and works
- [ ] Add product: saves to Supabase, appears in list, visible to WhatsApp bot
- [ ] Edit product: saves optimistically, rolls back on error
- [ ] Delete product: confirmation dialog, cascade remove from orders
- [ ] New order arrives via WhatsApp: appears in Kanban `New` column in realtime
- [ ] Drag order to `Preparing`: status updates in DB, customer gets WhatsApp message
- [ ] Push notification fires when new order arrives
- [ ] Analytics charts show real data for selected date range
- [ ] Settings save and persist on reload
- [ ] WhatsApp send from Conversations page: message delivered in WA
- [ ] Admin login: blocked for non-admins, works for admin_users rows
- [ ] Order tracking page: correct status shown publicly, updates in real time
- [ ] Vercel cron: `/api/cron/nudge-abandoned` returns 200 with correct Authorization header

---

*End of Porter UI/UX Overhaul Prompt. Every feature described above must be implemented with real, working code — no placeholder functions, no `// TODO`, no fake data arrays where Supabase queries are possible.*
