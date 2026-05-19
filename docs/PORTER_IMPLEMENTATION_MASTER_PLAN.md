# PORTER — Implementation Master Plan  
## Inventory + Website Ordering + WhatsApp Commerce for Indian Grocery & Local Stores

**Prepared for:** Porter implementation team  
**Prepared on:** 2026-05-19  
**Product direction:** Turn local Indian / ethnic grocery stores into live digital stores without forcing a full website rebuild.  
**Primary buyer:** Indian grocery stores abroad, kirana stores, mithai/farsan shops, fruit & vegetable shops, specialty food stores, and local retailers.  
**Core promise:** Add products once. Porter powers inventory, website ordering, WhatsApp ordering, pickup/delivery, payments, customer history, and seller operations.

---

## 0. Executive Summary

Porter should be implemented as a **single source of truth for store inventory and ordering**.

The product should not be positioned as only a WhatsApp bot or only an inventory system. It should be sold as a complete but lightweight digital ordering layer for stores that currently rely on calls, WhatsApp messages, notebooks, spreadsheets, and outdated websites.

### Final product statement

> **Porter helps local Indian grocery and retail stores put their products online, keep inventory updated, accept orders through WhatsApp or website, and manage pickup/delivery from one simple dashboard.**

### The implementation goal

Build a version of Porter that lets a store owner:

1. Create a store profile.
2. Upload or add products.
3. Track stock.
4. Publish a Porter storefront.
5. Add an `Order Online` button to their existing website.
6. Accept WhatsApp and website orders.
7. Reserve stock when an order is placed.
8. Fulfill, cancel, or modify orders.
9. See low-stock alerts.
10. Understand basic sales and product performance.

### What “perfectly done” means

This is not just about building features. “Perfectly done” means:

- The store owner can understand the dashboard in under 60 seconds.
- The customer can place an order without downloading an app.
- Inventory does not oversell during pickup/delivery ordering.
- Website integration works even for basic websites.
- The system is simple enough for a non-technical shopkeeper.
- Setup can be done manually by your team for early clients.
- Every feature supports the sales pitch: more orders, less manual coordination, better stock visibility.

---

# 1. Product Positioning

## 1.1 What Porter is

Porter is a **retail operating layer** for local stores.

It combines:

- Online storefront
- WhatsApp ordering
- Live inventory
- Seller dashboard
- Pickup/delivery workflow
- Payment links / COD / manual payment
- Website integration
- Customer/order history
- Store admin controls

## 1.2 What Porter is not

Porter should not be sold as:

- “Just a chatbot”
- “Just inventory software”
- “Just a website builder”
- “Just a POS”
- “Only for fruits”
- “Only for dark stores”

Porter should become the bridge between old retail workflows and modern ordering.

## 1.3 Best first market

### Primary market

Indian and South Asian grocery stores abroad:

- Canada
- United States
- United Kingdom
- Australia
- New Zealand
- UAE
- Singapore

These stores often have strong customer demand but poor digital ordering.

### Secondary market

India-based shopkeepers and kirana stores.

India is a stronger long-term market but more price-sensitive and competitive. Start with Indian stores abroad where the value of digital ordering is easier to demonstrate.

---

# 2. Core User Personas

## 2.1 Store Owner

### Needs

- Wants more orders.
- Does not want to manage complicated software.
- Wants customers to stop calling repeatedly to ask what is available.
- Wants stock visibility.
- Wants pickup/delivery orders in one clean place.
- Wants someone to set it up for them.

### UX requirement

The owner dashboard must be simple, friendly, and action-focused.

Do not overwhelm them with enterprise inventory language at first.

## 2.2 Store Staff

### Needs

- See new orders quickly.
- Know what to pack.
- Mark items unavailable or substituted.
- Update order status.
- Print or view packing list.
- Avoid mistakes.

### UX requirement

The order workflow should be large, touch-friendly, and mobile-first.

## 2.3 Customer

### Needs

- Check what is in stock.
- Order without app download.
- Use WhatsApp or simple web store.
- Choose pickup/delivery.
- Pay online or choose COD/manual payment.
- Reorder repeat items easily.

### UX requirement

The customer flow should feel like shopping from a clean local store, not using a complex marketplace app.

## 2.4 Porter Admin

### Needs

- Onboard stores.
- Manage sellers.
- Verify setup status.
- Help fix catalog, WhatsApp, and payment issues.
- View usage, orders, plan, and health.

### UX requirement

The admin panel should focus on onboarding status and store health.

---

# 3. MVP Scope

## 3.1 MVP must include

### Store management

- Store profile
- Store logo
- Store address
- Store hours
- Pickup settings
- Delivery settings
- Payment settings
- WhatsApp settings
- Public store slug

### Product catalog

- Product name
- Product description
- Category
- Price
- SKU/barcode optional
- Image URL/upload
- Unit type
- Variant support
- Active/inactive
- Listed/unlisted
- Stock quantity
- Low-stock threshold

### Inventory

- Add stock
- Reduce stock
- Manual adjustment
- Out-of-stock toggle
- Low-stock alerts
- Basic movement history
- Stock reservation on orders

### Storefront

- Public store page
- Product search
- Categories
- Product cards
- Stock status
- Cart
- Pickup/delivery selection
- Customer details
- Order confirmation

### Website integration

- Order Online button
- Storefront link
- Embeddable catalog script later
- Custom domain later

### WhatsApp ordering

- Customer message intake
- Product matching
- Cart building
- Address/pickup capture
- Order confirmation
- Payment/COD path
- Seller notification

### Seller dashboard

- Overview
- Live orders
- Products
- Inventory
- Customers
- Analytics basics
- Settings

### Admin panel

- Seller list
- Seller setup status
- Orders overview
- Plans
- Impersonation/support
- Platform settings

## 3.2 MVP should not include yet

Avoid these until the core is stable:

- Full POS replacement
- Complex supplier purchase orders
- Multi-location inventory
- Automated barcode catalog lookup
- Deep Shopify app
- Deep WooCommerce plugin
- Marketplace customer app
- Loyalty points
- Complex tax engine
- Staff payroll
- Accounting exports beyond CSV

---

# 4. Implementation Phases

## Phase 1 — Clean Product Foundation

### Goal

Make Porter feel like a complete seller product, not only a technical repo.

### Build

1. Final marketing landing page.
2. Demo store.
3. Demo seller account.
4. Demo customer storefront.
5. Demo WhatsApp-style ordering screen.
6. Basic onboarding checklist.
7. Pricing page.
8. Clean docs.

### Acceptance criteria

- A client can see exactly what Porter does in 2 minutes.
- The demo store has at least 40 realistic products.
- A fake order can be placed from storefront to seller dashboard.
- The dashboard shows order, stock, and customer information clearly.

---

## Phase 2 — Inventory MVP

### Goal

Make Porter inventory useful without becoming complicated.

### Build

1. Products CRUD.
2. Categories CRUD.
3. Product variants.
4. Stock quantity.
5. Low-stock threshold.
6. Stock movements.
7. Stock adjustment modal.
8. Order-based reservation.
9. Stock status labels.
10. Low-stock page.

### Acceptance criteria

- Adding stock creates a movement.
- Selling stock creates or completes movement based on order status.
- Cancelled order releases reserved stock.
- Storefront shows accurate stock status.
- Seller can mark product out of stock in one tap.

---

## Phase 3 — Porter Storefront

### Goal

Every store gets a modern orderable web store.

### Build

1. `/{storeSlug}` or `/store/{storeSlug}` public page.
2. Search.
3. Category filters.
4. Product cards.
5. Product detail drawer.
6. Cart drawer.
7. Pickup/delivery selection.
8. Customer information.
9. Payment/COD selection.
10. Order confirmation page.

### Acceptance criteria

- Customer can order in under 90 seconds.
- Storefront works perfectly on mobile.
- Products load fast.
- Out-of-stock items cannot be added unless pre-order is enabled.
- Cart reserves stock only after order submission.

---

## Phase 4 — Website Integration

### Goal

Let existing store websites become orderable without rebuilding them.

### Build in this order

1. Shareable Porter storefront link.
2. Website `Order Online` button snippet.
3. QR code generator.
4. Embedded catalog widget.
5. Custom domain support.
6. WooCommerce sync later.
7. Shopify sync later.

### Acceptance criteria

- Any store can add a button in less than 5 minutes.
- Embed script works on basic HTML and WordPress pages.
- Store owner can copy snippet from dashboard.
- Embedded product cards reflect live stock.

---

## Phase 5 — WhatsApp Commerce

### Goal

Use WhatsApp as the natural ordering interface for customers.

### Build

1. WhatsApp webhook.
2. Conversation state machine.
3. Product matching.
4. Cart update.
5. Customer profile linking.
6. Payment/COD flow.
7. Seller notifications.
8. Abandoned order nudges.
9. Multi-language prompts.

### Acceptance criteria

- Customer can type natural orders like “2 paneer, 1 atta, 1 maggi”.
- Bot suggests closest matching products.
- Seller can see WhatsApp order in the same order dashboard.
- If payment is not completed, order status is clear.
- Abandoned chats can be nudged automatically.

---

## Phase 6 — Analytics & Monetization

### Goal

Show store owners why Porter is worth paying for.

### Build

1. Revenue overview.
2. Orders overview.
3. Top products.
4. Average order value.
5. Repeat customers.
6. Low-stock impact.
7. Missed-order / abandoned-order recovery.
8. Plan gates.
9. Billing subscription.
10. Usage limits.

### Acceptance criteria

- Seller can see “orders this month”.
- Seller can see “top 5 products”.
- Seller can see “low stock items”.
- Plan limits are enforced.
- Admin can assign plans.

---

# 5. Information Architecture

## 5.1 Seller dashboard navigation

Recommended navigation:

1. Dashboard
2. Orders
3. Products
4. Inventory
5. Customers
6. Website
7. WhatsApp
8. Analytics
9. Settings

### Mobile bottom navigation

For a mobile-first seller dashboard:

1. Home
2. Orders
3. Products
4. Inventory
5. More

The “More” screen contains Website, WhatsApp, Analytics, Settings, Support.

## 5.2 Admin navigation

1. Overview
2. Sellers
3. Orders
4. Store setup
5. Plans
6. Analytics
7. Support
8. Platform settings

---

# 6. UI/UX Design System

## 6.1 Visual direction

Use a premium local-retail SaaS style:

- White/cream background
- Emerald green as primary action color
- Saffron/orange as accent
- Deep charcoal text
- Soft rounded cards
- Modern Indian-local-store warmth
- Clean enterprise SaaS structure
- Large touch targets
- Low clutter
- Friendly icons

## 6.2 Brand tokens

```css
:root {
  --porter-bg: #fffaf2;
  --porter-surface: #ffffff;
  --porter-surface-soft: #f8fbf4;
  --porter-primary: #0f7a3a;
  --porter-primary-dark: #07592a;
  --porter-accent: #f26b00;
  --porter-accent-soft: #fff1df;
  --porter-warning: #f4a000;
  --porter-danger: #d83b32;
  --porter-info: #2563eb;
  --porter-text: #111827;
  --porter-muted: #667085;
  --porter-border: #eadfce;
  --porter-shadow: 0 12px 30px rgba(15, 122, 58, 0.08);
  --porter-radius-sm: 10px;
  --porter-radius-md: 16px;
  --porter-radius-lg: 24px;
  --porter-radius-xl: 32px;
}
```

## 6.3 Typography

Recommended:

- Headings: Inter, Satoshi, or Plus Jakarta Sans.
- Body: Inter or system font.
- Avoid overly decorative fonts inside dashboard.
- Use large readable numbers for store metrics.
- Keep line-height generous.

### Desktop type scale

- Page title: 32–40px
- Section title: 20–24px
- Card title: 16–18px
- Body: 14–16px
- Caption: 12–13px

### Mobile type scale

- Page title: 24–28px
- Section title: 18–20px
- Card title: 15–17px
- Body: 14–15px
- Caption: 12px

## 6.4 Spacing system

Use an 8px spacing system.

```txt
4px  = micro
8px  = tight
12px = compact
16px = standard
24px = section
32px = large section
48px = page
```

## 6.5 Card rules

All important modules should be cards.

Card style:

- Background: white
- Border: 1px solid warm border
- Radius: 20–28px
- Shadow: soft and subtle
- Padding: 16–24px mobile, 24–32px desktop

## 6.6 Button rules

### Primary button

Use for main actions:

- Add product
- Confirm order
- Save changes
- Go live
- Copy website button

```css
background: var(--porter-primary);
color: white;
border-radius: 999px;
height: 44px;
padding: 0 20px;
font-weight: 700;
```

### Secondary button

Use for non-destructive actions:

- Preview store
- Export CSV
- View details

```css
background: #ffffff;
border: 1px solid var(--porter-border);
color: var(--porter-text);
border-radius: 999px;
```

### Accent button

Use sparingly for onboarding:

- Launch store
- Setup WhatsApp
- Upgrade plan

```css
background: var(--porter-accent);
color: white;
```

## 6.7 Empty states

Every empty state must teach the user.

Bad:

> No products.

Good:

> Add your first products to publish your online store. You can add manually or import CSV.

Include CTA:

- Add product
- Import CSV
- Use starter grocery catalog

---

# 7. Core Data Model

## 7.1 Essential tables

### stores

```sql
stores (
  id uuid primary key,
  owner_user_id uuid references auth.users(id),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  phone text,
  whatsapp_number text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  country text,
  postal_code text,
  timezone text default 'Asia/Kolkata',
  currency text default 'INR',
  is_active boolean default true,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### categories

```sql
categories (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

### products

```sql
products (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  category_id uuid references categories(id),
  name text not null,
  slug text not null,
  description text,
  image_url text,
  sku text,
  barcode text,
  unit_label text, -- kg, g, lb, piece, pack, box, dozen
  base_price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  is_active boolean default true,
  is_listed boolean default true,
  allow_backorder boolean default false,
  low_stock_threshold int default 5,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### product_variants

```sql
product_variants (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  name text not null, -- 1kg, 5kg, 10kg, Small, Large
  sku text,
  barcode text,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  unit_label text,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

### inventory_locations

```sql
inventory_locations (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  name text not null default 'Main Store',
  type text default 'store', -- store, warehouse, delivery_vehicle
  is_default boolean default false,
  created_at timestamptz default now()
);
```

### inventory_balances

```sql
inventory_balances (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  variant_id uuid references product_variants(id),
  location_id uuid references inventory_locations(id),
  on_hand int not null default 0,
  reserved int not null default 0,
  available int generated always as (on_hand - reserved) stored,
  updated_at timestamptz default now(),
  unique(product_id, variant_id, location_id)
);
```

### inventory_movements

```sql
inventory_movements (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  variant_id uuid references product_variants(id),
  location_id uuid references inventory_locations(id),
  movement_type text not null,
  quantity_change int not null,
  previous_on_hand int,
  new_on_hand int,
  reason text,
  source text, -- manual, website_order, whatsapp_order, csv_import, admin
  order_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

### orders

```sql
orders (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  order_number text not null,
  source text not null, -- storefront, whatsapp, manual, admin, widget
  status text not null default 'pending',
  payment_status text default 'unpaid',
  fulfillment_type text not null, -- pickup, delivery
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address jsonb,
  subtotal numeric(12,2) default 0,
  delivery_fee numeric(12,2) default 0,
  discount_amount numeric(12,2) default 0,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  notes text,
  internal_notes text,
  placed_at timestamptz default now(),
  accepted_at timestamptz,
  fulfilled_at timestamptz,
  cancelled_at timestamptz
);
```

### order_items

```sql
order_items (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  product_name_snapshot text not null,
  variant_name_snapshot text,
  quantity int not null,
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null,
  fulfillment_status text default 'pending',
  substitution_status text default 'none',
  created_at timestamptz default now()
);
```

### stock_reservations

```sql
stock_reservations (
  id uuid primary key,
  store_id uuid references stores(id) on delete cascade,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  quantity int not null,
  status text default 'reserved', -- reserved, fulfilled, released, expired
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

# 8. Inventory Logic

## 8.1 Important principle

Inventory should be ledger-based.

Do not only update `stock_quantity` directly without recording why it changed.

Every stock change must create an inventory movement.

## 8.2 Stock states

### on_hand

Physical stock the store believes it has.

### reserved

Stock held for orders that are placed but not fulfilled.

### available

Stock available for new customers.

```txt
available = on_hand - reserved
```

## 8.3 Order lifecycle and stock

### When order is placed

- Create order with `status = pending`.
- Create stock reservations.
- Increase `reserved`.
- Do not decrease `on_hand` yet.

### When order is accepted

- Keep reservation.
- Set `status = confirmed`.

### When order is preparing

- Keep reservation.
- Set `status = preparing`.

### When order is fulfilled

- Decrease `on_hand`.
- Decrease `reserved`.
- Mark reservations fulfilled.
- Create inventory movement `sale`.

### When order is cancelled

- Decrease `reserved`.
- Mark reservations released.
- Create inventory movement `reservation_released`.

### When order expires

- Release reservation.
- Mark order expired/cancelled.

## 8.4 Movement types

Use these movement types:

```txt
stock_received
sale
reservation_created
reservation_fulfilled
reservation_released
manual_adjustment
return
damage
expired
correction
csv_import
admin_adjustment
```

## 8.5 Low-stock logic

A product is low stock when:

```txt
available <= low_stock_threshold
```

A product is out of stock when:

```txt
available <= 0 AND allow_backorder = false
```

A product can be shown as “few left” when:

```txt
available <= low_stock_threshold AND available > 0
```

---

# 9. Website Integration

## 9.1 Level 1 — Storefront link

This is the first version.

Each store gets:

```txt
https://porter.app/store/{storeSlug}
```

The seller can copy:

```html
<a href="https://porter.app/store/patel-grocery" target="_blank">
  Order Online
</a>
```

## 9.2 Level 2 — Styled website button

Provide a copy-paste button:

```html
<a
  href="https://porter.app/store/patel-grocery"
  style="
    display:inline-flex;
    align-items:center;
    justify-content:center;
    background:#0f7a3a;
    color:#fff;
    border-radius:999px;
    padding:14px 22px;
    font-weight:700;
    text-decoration:none;
    font-family:Inter,system-ui,sans-serif;
  "
>
  Order Online
</a>
```

## 9.3 Level 3 — Embeddable catalog widget

Future widget:

```html
<div id="porter-catalog"></div>
<script
  src="https://porter.app/widget.js"
  data-store="patel-grocery"
  data-mode="catalog"
  data-container="#porter-catalog"
></script>
```

Modes:

```txt
button
featured
catalog
search
cart
offers
```

## 9.4 Level 4 — Custom domain

Examples:

```txt
order.patelgrocery.com
shop.patelgrocery.com
```

Implementation:

- Add `custom_domain` to stores table.
- Add DNS setup instructions.
- Verify CNAME.
- Map domain to store page.

## 9.5 Level 5 — WooCommerce/Shopify sync

Do not start here.

Build after Porter storefront is stable.

Possible sync directions:

### Porter owns inventory

- Website displays Porter data.
- Porter manages stock.

### Website owns inventory

- Porter reads from WooCommerce/Shopify.
- Porter sends orders back.

### Two-way sync

- Advanced only.
- Requires conflict handling.

MVP recommendation:

> Porter owns inventory.

---

# 10. Seller Dashboard UX

## 10.1 Dashboard home

### Purpose

Show the store owner what needs attention today.

### Sections

1. Greeting and store status.
2. Today’s orders.
3. Pending orders.
4. Low-stock items.
5. Sales this week.
6. Quick actions.
7. Setup checklist if not launched.

### Hero status card

```txt
Store status: Live
Online store: Active
WhatsApp: Connected
Payments: Needs setup
Products: 248 listed
Low stock: 17 items
```

### Quick actions

- Add product
- Import catalog
- View live store
- Copy website button
- Manage orders

## 10.2 Orders page

### Layout

Use kanban or status columns on desktop:

1. New
2. Confirmed
3. Preparing
4. Ready for pickup
5. Out for delivery
6. Completed
7. Cancelled

On mobile:

Use tabs or segmented control, not stacked columns.

### Order card content

- Order number
- Customer name
- Source badge: Website / WhatsApp / Manual
- Fulfillment badge: Pickup / Delivery
- Payment badge: Paid / Unpaid / COD
- Item count
- Total
- Time placed
- Status actions

### Order detail drawer

Must include:

- Customer details
- Order items
- Substitution controls
- Payment status
- Fulfillment method
- Customer notes
- Internal notes
- Status timeline
- Print packing list
- Cancel order
- Refund/manual note later

## 10.3 Products page

### Product list columns

- Image
- Product name
- Category
- Price
- Stock status
- Listed status
- Quick actions

### Product card mobile

- Thumbnail
- Name
- Price
- Available stock
- Category
- Toggle listed
- Edit button

### Product editor

Fields:

- Product name
- Category
- Description
- Image
- Price
- Unit
- SKU/barcode
- Stock
- Low-stock threshold
- Listed on storefront
- Listed on WhatsApp
- Variants

## 10.4 Inventory page

### Purpose

Make stock action fast.

Tabs:

1. All stock
2. Low stock
3. Out of stock
4. Recent movements
5. Import/export

### Quick stock adjustment

Modal:

```txt
Product: Amul Paneer 200g
Current stock: 18
Action:
- Add stock
- Reduce stock
- Set exact stock
Quantity:
Reason:
Save
```

### Movement history

Show:

- Date
- Product
- Movement type
- Quantity
- Reason
- Source
- User

## 10.5 Website page

### Purpose

Help the seller publish Porter to their website.

Sections:

1. Storefront preview.
2. Public store link.
3. Copy button snippet.
4. QR code.
5. Embed widget setup.
6. Custom domain setup later.

### Must-have copy

```txt
Your website does not need to be rebuilt.
Add this Order Online button and Porter will handle catalog, cart, checkout, and orders.
```

## 10.6 WhatsApp page

### Purpose

Show connection status and allow testing.

Sections:

1. WhatsApp status.
2. Connected number.
3. Test bot.
4. Greeting message.
5. Supported languages.
6. Product matching settings.
7. Abandoned order nudge.
8. Business hours/off-hours reply.

## 10.7 Analytics page

### MVP analytics

- Orders today
- Orders this week/month
- Revenue
- Average order value
- Top products
- Repeat customers
- Low-stock items
- Abandoned chats recovered

Keep analytics simple and useful.

---

# 11. Customer Storefront UX

## 11.1 Storefront page structure

### Header

- Store logo
- Store name
- Search
- Cart
- Store status: open/closed

### Hero

- Store banner
- Pickup/delivery info
- Minimum order
- Delivery fee
- Today’s availability

### Categories

Horizontal chips:

- Fresh produce
- Dairy
- Frozen
- Spices
- Snacks
- Rice/flour
- Beverages
- Pooja items

### Product grid

Each product card:

- Image
- Name
- Variant/unit
- Price
- Stock label
- Add button

### Product card stock labels

```txt
In stock
Only 3 left
Out of stock
Pre-order
Available tomorrow
```

## 11.2 Cart drawer

Must show:

- Items
- Quantity controls
- Subtotal
- Delivery fee
- Total
- Pickup/delivery selection
- Checkout button

## 11.3 Checkout

Fields:

- Name
- Phone
- Email optional
- Delivery/pickup
- Address if delivery
- Notes
- Payment method
- Confirm order

## 11.4 Confirmation page

Show:

- Order number
- Store name
- Items
- Total
- Pickup/delivery instructions
- WhatsApp contact
- Payment status
- Estimated time

---

# 12. Onboarding Flow

## 12.1 Admin-assisted onboarding

For early clients, do this manually.

### Step 1 — Create store

- Store name
- Phone
- Address
- Logo
- Store hours
- Currency
- Timezone

### Step 2 — Catalog

Options:

- Manual add
- CSV import
- Starter grocery catalog
- Import from existing website
- Import from photos/flyers later

### Step 3 — Inventory

- Add stock
- Set low-stock thresholds
- Mark active/listed products

### Step 4 — Ordering

- Pickup enabled
- Delivery enabled
- Delivery zones
- Minimum order
- Delivery fee

### Step 5 — Payments

- India: Razorpay / UPI / COD
- Abroad: initially manual payment/COD, later Stripe/Square/etc.

### Step 6 — Website

- Copy store link
- Add button
- Generate QR poster
- Preview storefront

### Step 7 — WhatsApp

- Connect WhatsApp
- Test order
- Test reply
- Go live

## 12.2 Setup checklist UI

Show checklist in dashboard:

```txt
✓ Store profile completed
✓ 50 products added
✓ Pickup enabled
□ Payment setup
□ Website button added
□ WhatsApp tested
□ Store live
```

---

# 13. Catalog Import

## 13.1 CSV template

Columns:

```csv
category,name,description,unit,variant,price,stock,low_stock_threshold,sku,barcode,image_url,is_active,is_listed
```

Example:

```csv
Dairy,Amul Paneer,Fresh paneer,200g,,4.99,25,5,AMUL-PANEER-200,,https://...,true,true
Rice & Flour,Aashirvaad Atta,Whole wheat flour,5kg,,13.99,12,3,AASH-ATTA-5KG,,https://...,true,true
```

## 13.2 Import UX

Steps:

1. Upload CSV.
2. Preview detected columns.
3. Map columns if needed.
4. Validate products.
5. Show errors.
6. Confirm import.
7. Create products and movements.

## 13.3 Import validation

Required fields:

- name
- price

Recommended:

- category
- unit
- stock

Validation errors:

- Missing name
- Invalid price
- Negative stock
- Duplicate SKU
- Invalid boolean
- Category not found

Auto-create categories if enabled.

---

# 14. Payments

## 14.1 Payment methods

### India

- Razorpay payment link
- UPI manual
- COD

### Abroad MVP

- Pay in store
- Pay on pickup
- COD/manual delivery payment
- Payment note
- Later: Stripe / Square / Moneris / SumUp

## 14.2 Payment status values

```txt
unpaid
payment_link_sent
paid
failed
refunded
cod
manual_pending
manual_confirmed
```

## 14.3 UX rule

Never confuse order status with payment status.

Example:

```txt
Order status: Preparing
Payment status: COD
```

---

# 15. Delivery and Pickup

## 15.1 Pickup MVP

Fields:

- Pickup enabled
- Pickup instructions
- Preparation time
- Pickup slots
- Store hours

## 15.2 Delivery MVP

Fields:

- Delivery enabled
- Delivery fee
- Minimum order
- Delivery radius or postal codes
- Delivery instructions
- Estimated time
- Free delivery threshold

## 15.3 Delivery status

```txt
pending
confirmed
preparing
ready_for_pickup
out_for_delivery
delivered
completed
cancelled
```

---

# 16. Notifications

## 16.1 Seller notifications

Notify seller when:

- New order arrives
- Payment completed
- Customer cancels
- Product goes out of stock
- Product hits low-stock threshold
- WhatsApp conversation needs attention

Channels:

- Dashboard alert
- Push notification
- Email
- WhatsApp/SMS later

## 16.2 Customer notifications

Notify customer when:

- Order confirmed
- Payment link sent
- Order preparing
- Ready for pickup
- Out for delivery
- Completed
- Cancelled
- Substitution needed

---

# 17. Security and Permissions

## 17.1 Roles

### Store roles

```txt
owner
manager
staff
viewer
```

### Admin roles

```txt
super_admin
support_admin
billing_admin
```

## 17.2 Permissions

### Owner

- Full access
- Billing
- Settings
- Staff
- Integrations

### Manager

- Orders
- Products
- Inventory
- Analytics

### Staff

- Orders
- Inventory adjustments
- View products

### Viewer

- Read-only dashboard

## 17.3 Row-level security

All seller-facing data must be scoped by `store_id`.

Never allow a seller to query another store’s orders, products, or customers.

---

# 18. Plan and Pricing Logic

## 18.1 Suggested plans

### Starter

For stores starting digital ordering.

Price:

- Abroad: $49–$79/month
- India: ₹999–₹1,999/month

Includes:

- Online store link
- WhatsApp ordering
- Basic inventory
- Pickup orders

Limits:

- 300 orders/month
- 500 products
- 1 staff account
- Basic analytics

### Growth

For stores ready for delivery and repeat business.

Price:

- Abroad: $99–$199/month
- India: ₹2,999–₹5,999/month

Includes:

- Delivery workflow
- Low-stock alerts
- Customer insights
- Offers
- Advanced operations

Limits:

- 2,000 orders/month
- 5,000 products
- 5 staff accounts
- 90-day analytics

### Setup & Onboarding

One-time done-for-you service.

Price:

- Abroad: $149–$499
- India: ₹4,999–₹14,999

Includes:

- Catalog upload
- Store branding
- QR poster
- Website order button
- WhatsApp test
- Launch support

## 18.2 Billing MVP

Initially admin-managed plans are acceptable.

Later:

- Stripe for abroad
- Razorpay subscriptions for India
- Plan gates enforced in app

---

# 19. Critical API Endpoints

## 19.1 Public storefront

```txt
GET    /api/public/stores/:slug
GET    /api/public/stores/:slug/categories
GET    /api/public/stores/:slug/products
GET    /api/public/stores/:slug/products/:productSlug
POST   /api/public/stores/:slug/orders
POST   /api/public/stores/:slug/cart/validate
```

## 19.2 Seller products

```txt
GET    /api/seller/products
POST   /api/seller/products
GET    /api/seller/products/:id
PATCH  /api/seller/products/:id
DELETE /api/seller/products/:id
POST   /api/seller/products/import
```

## 19.3 Seller inventory

```txt
GET    /api/seller/inventory
POST   /api/seller/inventory/adjust
GET    /api/seller/inventory/movements
GET    /api/seller/inventory/low-stock
POST   /api/seller/inventory/reserve
POST   /api/seller/inventory/release
```

## 19.4 Orders

```txt
GET    /api/seller/orders
GET    /api/seller/orders/:id
PATCH  /api/seller/orders/:id/status
POST   /api/seller/orders/:id/cancel
POST   /api/seller/orders/:id/substitute
POST   /api/seller/orders/:id/print
```

## 19.5 Website integration

```txt
GET    /api/seller/website/snippet
GET    /api/widget/:storeSlug/config
GET    /api/widget/:storeSlug/products
POST   /api/widget/:storeSlug/orders
```

## 19.6 WhatsApp

```txt
POST   /api/webhook/whatsapp
GET    /api/webhook/whatsapp
POST   /api/seller/whatsapp/test
PATCH  /api/seller/whatsapp/settings
```

---

# 20. Screen-by-Screen UI Requirements

## 20.1 Seller dashboard home

### Components

- Header
- Store status pill
- Today metrics
- Setup checklist
- Recent orders
- Low-stock list
- Quick actions
- Storefront preview card

### Acceptance

- Seller sees urgent work first.
- Important actions are one tap away.
- No dense tables on mobile.

---

## 20.2 Orders board

### Components

- Search
- Status tabs/columns
- Order cards
- Order detail drawer
- Packing list
- Status actions
- Payment status

### Acceptance

- New order can be accepted in one click.
- Mobile flow is usable in-store.
- Order item list is readable.
- WhatsApp/website source is obvious.

---

## 20.3 Product management

### Components

- Search
- Category filter
- Stock status filter
- Product list
- Add product button
- Bulk actions
- Product editor drawer

### Acceptance

- Product can be added in under 45 seconds.
- Stock can be adjusted in under 15 seconds.
- Out-of-stock product is clearly marked.

---

## 20.4 Inventory management

### Components

- Low-stock summary
- Stock table
- Movement timeline
- Adjustment modal
- Import/export tools

### Acceptance

- Every adjustment leaves a trace.
- Seller can quickly find low-stock items.
- CSV import is clear and recoverable.

---

## 20.5 Website setup

### Components

- Public store preview
- Store URL
- Copy website button
- HTML snippet
- QR code
- Embed widget preview
- Custom domain placeholder

### Acceptance

- Seller can copy link/snippet easily.
- Storefront preview opens in new tab.
- QR code can be downloaded/printed.

---

## 20.6 WhatsApp setup

### Components

- Connection status
- Number
- Test message
- Bot greeting
- Language settings
- Off-hours message
- Abandoned nudge toggle

### Acceptance

- Store owner understands whether WhatsApp is live.
- Test message can be sent safely.
- Bot settings are simple.

---

# 21. Quality Checklist

## 21.1 Product quality

- [ ] Store can be created.
- [ ] Products can be added.
- [ ] CSV import works.
- [ ] Inventory movements are recorded.
- [ ] Storefront displays live products.
- [ ] Customer can place website order.
- [ ] WhatsApp order becomes dashboard order.
- [ ] Payment status is separate from order status.
- [ ] Stock reserves on order.
- [ ] Stock releases on cancellation.
- [ ] Stock deducts on completion.
- [ ] Low-stock alert appears.
- [ ] Order can be printed/exported.
- [ ] Website button snippet works.
- [ ] Dashboard is mobile-friendly.

## 21.2 UI quality

- [ ] Consistent radius.
- [ ] Consistent spacing.
- [ ] Clean hierarchy.
- [ ] No overcrowding.
- [ ] Mobile-first.
- [ ] Touch targets at least 44px high.
- [ ] Buttons are obvious.
- [ ] Empty states teach the user.
- [ ] Error states are friendly.
- [ ] Loading states are present.
- [ ] Tables collapse properly on mobile.

## 21.3 Technical quality

- [ ] RLS tested.
- [ ] Webhook signatures verified.
- [ ] No secrets exposed to frontend.
- [ ] API routes validate store ownership.
- [ ] Rate limits on public endpoints.
- [ ] Inventory changes are transactional.
- [ ] Order creation is atomic.
- [ ] Logs exist for webhook failures.
- [ ] CSV import has validation.
- [ ] Tests cover inventory reservation.

---

# 22. Implementation Order for Developer / AI Builder

Build exactly in this order to avoid chaos:

1. Audit existing schema and screens.
2. Create/verify store, product, category, order, order_item tables.
3. Add inventory balances and movements.
4. Build inventory service functions.
5. Add stock adjustment UI.
6. Add product import CSV.
7. Build public storefront.
8. Build cart and checkout.
9. Connect website orders to order dashboard.
10. Implement reservation logic.
11. Update order statuses to update stock.
12. Add website setup page with button snippet.
13. Add QR code generation.
14. Improve seller dashboard home.
15. Add analytics MVP.
16. Add onboarding checklist.
17. Add plan gates.
18. Add embedded widget.
19. Add custom domains.
20. Add external payment integrations.
21. Add WooCommerce/Shopify sync.

---

# 23. Exact Developer Prompt

Use this prompt with an AI coding assistant:

```txt
You are implementing Porter, a WhatsApp-first inventory and ordering platform for local Indian grocery and retail stores.

Goal:
Make Porter the single source of truth for products, stock, website ordering, WhatsApp ordering, and seller operations.

Do not overbuild. Build the MVP in a clean, production-ready way.

Core requirements:
1. Inventory must be ledger-based.
2. Every stock change must create an inventory movement.
3. Orders must reserve stock when placed.
4. Completed orders must deduct stock.
5. Cancelled orders must release stock.
6. Public storefront must show live stock status.
7. Seller dashboard must be mobile-first and simple.
8. Website integration must start with an Order Online button and Porter storefront link.
9. All seller data must be scoped by store_id and protected with RLS.
10. Use the existing Porter style and improve it into a premium local-retail SaaS UI.

Build sequence:
- Add/verify schema.
- Implement inventory service.
- Implement product CRUD improvements.
- Implement public storefront.
- Implement cart and order creation.
- Implement order-to-inventory lifecycle.
- Implement website setup page.
- Implement onboarding checklist.
- Implement analytics basics.

UI style:
White/cream background, emerald primary, saffron accent, rounded cards, soft shadows, large touch targets, clean typography, minimal clutter, mobile-first.

Acceptance:
A real Indian grocery store owner should be able to:
- Add products.
- Add stock.
- Publish online store.
- Add Order Online button to website.
- Accept website/WhatsApp orders.
- Track inventory.
- See low-stock alerts.
- Manage orders from phone.
```

---

# 24. Client Sales Implementation

## 24.1 What to promise

Promise:

- Online store link
- Website order button
- WhatsApp ordering
- Basic inventory
- Pickup/delivery order management
- Setup support
- Low-stock visibility

Do not promise immediately:

- Full POS replacement
- Perfect automatic inventory without staff input
- Same-day Shopify/WooCommerce sync
- Complex accounting

## 24.2 First client onboarding script

```txt
We are not replacing your current website.
We are making it orderable.

You add products once in Porter.
Your customers can order through your website link, WhatsApp, or QR code.
You get clean orders in one dashboard.
Stock updates as orders are handled.
```

## 24.3 First 5 pilot deliverables

For every pilot store:

- Storefront
- 50–100 products uploaded
- Website order button
- QR poster
- WhatsApp test
- Staff training
- Order dashboard
- Low-stock setup
- 30-day performance review

---

# 25. Final Build Definition

Porter is ready to sell when:

1. The demo is polished.
2. A test store can go live in one day.
3. Product import works.
4. Website ordering works.
5. WhatsApp ordering works.
6. Stock updates correctly.
7. Seller dashboard works on phone.
8. The client can clearly understand pricing.
9. You can show business impact with example ROI.
10. You can onboard the next store using the same checklist.

---

# 26. Final Recommendation

Build Porter in this exact order:

```txt
Inventory foundation
→ Porter storefront
→ Website button
→ WhatsApp ordering
→ Seller dashboard polish
→ Onboarding checklist
→ Analytics
→ Pricing/plan gates
→ Embeddable widget
→ External integrations
```

The best first version is not a huge enterprise system. It is:

> **A clean live online store + WhatsApp ordering + simple inventory dashboard for local stores.**

That is what clients will understand, pay for, and use.
