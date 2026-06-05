# Deployment checklist

## Before deploy

1. Run locally: `npm ci && npm run verify && npm run test:e2e`
2. Apply Supabase migrations `001` → `018` in order (see README).
3. Set all production env vars from `.env.example`.
4. Set `PORTER_IMPERSONATION_SECRET` (unique per environment, 32+ random chars).
5. Set `META_APP_SECRET` for WhatsApp webhook signature validation.
6. Set `RAZORPAY_WEBHOOK_SECRET` and configure Razorpay webhook URL.
7. Configure Meta webhook: verify token + app secret.
8. Vercel cron: `CRON_SECRET` + `vercel.json` cron path.

## After deploy

1. `GET /api/health` returns `{ "ok": true }`.
2. Sign up / login seller flow.
3. Place test order on storefront.
4. Razorpay test payment + webhook (dashboard shows paid).
5. WhatsApp test message (if Meta connected).
6. Install PWA on iPhone — run `docs/QA_IOS_PWA.md` manual rows.
7. Push test from dashboard settings (`/api/push/test`).

## Rollback

- Revert Vercel deployment.
- Do not drop `webhook_events` in production without backup — idempotency depends on it.

## CI

Push to `main` or `cursor/**` runs `.github/workflows/verify.yml` (lint, typecheck, unit tests, build, Playwright smoke).
