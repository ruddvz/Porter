# Porter Master Plan — Execution Status

**Canonical plan:** [PORTER_IMPLEMENTATION_MASTER_PLAN.md](./PORTER_IMPLEMENTATION_MASTER_PLAN.md) (from `porter_implementation_package.zip` on `main`).

Branch: `cursor/openwa-inventory-storefront-1fd5`

## Done in this branch

| Item | Status |
|------|--------|
| Official zip extracted to `docs/` | ✅ |
| `store_slug`, OpenWA columns, inventory ledger | ✅ migration `015` |
| Unified `lib/whatsapp.ts` (Meta + OpenWA) | ✅ |
| OpenWA client + webhook + seller connect API | ✅ |
| Public storefront `/store/[slug]` | ✅ |
| Public APIs `GET/POST /api/public/stores/:slug/*` | ✅ |
| Website snippet API | ✅ `/api/seller/website/snippet` |
| Stock reservations on storefront checkout | ✅ `lib/public-store-order.ts` |
| Settings: Website + WhatsApp (OpenWA QR) tabs | ✅ |
| `docker-compose.openwa.yml` + env docs | ✅ |

## Existing on `main` before this branch

- Meta WhatsApp bot, seller dashboard, Razorpay, track page, PWA

## Next

- Wire WhatsApp bot orders through `reserveStockForOrder` (storefront already does)
- Dashboard home: setup checklist, copy website button (per blueprint)
- `public/widget.js` embed (Phase 4)
- Categories table + product slugs (per zip schema §7)
- Apply migration `015` in Supabase
