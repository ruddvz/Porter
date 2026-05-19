# Porter Master Plan — Execution Status

**Canonical plan:** [PORTER_IMPLEMENTATION_MASTER_PLAN.md](./PORTER_IMPLEMENTATION_MASTER_PLAN.md)

## Branch: `cursor/follow-ups-categories-widget-1fd5` (follow-ups PR)

| Item | Status |
|------|--------|
| Categories CRUD dashboard (`/dashboard/categories`) + product `category_id` in modal | ✅ |
| Order detail panel → status buttons + inventory sync on cancel/delivered | ✅ |
| Widget `cart` mode with inline checkout (`orderSource: widget`) | ✅ |
| Razorpay paid webhook → optional `auto_commit_inventory_on_payment` (migration `017`) | ✅ |

## Branch: `cursor/phase2-ledger-widget-dashboard-1fd5` (PR #19)

| Item | Status |
|------|--------|
| WhatsApp bot uses `reserveStockForOrder` (not direct stock decrement) | ✅ |
| Order cancel/deliver → inventory sync API | ✅ |
| Embeddable `public/widget.js` + `/api/widget/:slug/*` (CORS) | ✅ |
| Dashboard setup checklist card | ✅ |
| Low-stock uses `low_stock_threshold` | ✅ |
| Migration `016` categories + product_slug | ✅ |
| Inventory ledger UI + adjust/movements APIs | ✅ |

## Branch: `cursor/openwa-inventory-storefront-1fd5` (PR #18)

OpenWA, public storefront, migration `015`, website snippet.
