# Row Level Security audit

Porter uses Supabase RLS for seller-scoped tables. Admin and webhook routes use the **service role** server-side only.

## Summary

| Table | RLS | Seller policies | Service role |
|-------|-----|-----------------|--------------|
| `sellers` | Yes | select/update/insert own (`auth.uid() = user_id`) | Onboarding, webhooks |
| `products` | Yes | all own | Catalog APIs |
| `customers` | Yes | all own | Bot/webhooks |
| `orders` | Yes | select/insert/update own | Webhooks, public order create |
| `order_items` | Yes | select/insert/update/delete own | Realtime |
| `order_events` | Yes | select/insert own | Status APIs |
| `conversation_messages` | Yes | select/insert own | WhatsApp ingest |
| `categories` | Yes | `categories_own` | Seller CRUD API |
| `inventory_movements` | Yes | `inventory_movements_own` | Adjust API |
| `stock_reservations` | Yes | `stock_reservations_own` | Order placement |
| `seller_push_subscriptions` | Yes | own | Push APIs |
| `platform_events` | Yes | admin select only | Admin UI |
| `broadcast_messages` | Yes | own | Broadcast API |
| `webhook_events` | Yes | **no policies** (service role only) | Webhook routes |
| `admin_users` | Yes | admin RPC | Middleware |

## Public storefront

- `/api/public/stores/[slug]/*` uses service role with slug lookup; does not expose other sellers' data.
- `/store/[slug]` is server-rendered with store-scoped queries.

## Risks / notes

1. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
2. Impersonation cookie is HttpOnly, HMAC-signed (`PORTER_IMPERSONATION_SECRET`); verified server-side for dashboard context only.
3. `webhook_events` has RLS enabled with zero policies — only service role can read/write.

## Verification

After migrations, in SQL editor:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Policy definitions live in `supabase/migrations/001_initial_schema.sql` and follow-ups `009`–`018`.
