# Porter — Master Product Plan

> **Canonical spec:** [`PORTER_IMPLEMENTATION_MASTER_PLAN.md`](./PORTER_IMPLEMENTATION_MASTER_PLAN.md) (from `porter_implementation_package.zip` on `main`).  
> **UI blueprint:** [`porter_visual_blueprint.json`](./porter_visual_blueprint.json)

## Summary

Porter is the store’s **single source of truth** for inventory and ordering:

- Porter-hosted storefront: `/store/{store_slug}`
- Website “Order Online” button (Level 1 integration)
- WhatsApp ordering (OpenWA self-hosted **or** Meta Cloud API)
- Ledger-based inventory with reservations
- Seller dashboard

## WhatsApp: OpenWA vs Meta

| Provider | Cost model | Setup |
|----------|------------|--------|
| **OpenWA** | Self-hosted, no per-message Meta fees | Docker + QR scan in dashboard |
| **Meta** | Cloud API per conversation | WABA + webhook |

See [`OpenWA-integration.md`](./OpenWA-integration.md).

## Build phases (from implementation package)

1. **Phase 1–3:** Storefront + inventory MVP + website link
2. **Phase 4:** Embeddable widget
3. **Phase 5:** WhatsApp commerce (in progress — OpenWA path added)
4. **Phase 6+:** Analytics, WooCommerce/Shopify

## Execution status

See [`Porter-master-plan-execution-status.md`](./Porter-master-plan-execution-status.md).
