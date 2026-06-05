# Webhooks

Porter ingests external events via API routes. All production webhooks must be authenticated and idempotent.

## Meta WhatsApp (`/api/webhook/whatsapp`)

| Method | Purpose |
|--------|---------|
| GET | Subscription verification (`hub.verify_token` must match `META_WEBHOOK_VERIFY_TOKEN`) |
| POST | Incoming messages |

**POST security**

- Header: `X-Hub-Signature-256` = `sha256=` + HMAC-SHA256 of the **raw body** using `META_APP_SECRET`.
- Production: rejects requests when `META_APP_SECRET` is missing or signature is invalid (401).
- Development: validates when secret and signature are both present; allows unsigned payloads only when no secret is configured.

**Idempotency**

- Uses `webhook_events` via `claimWebhookEvent(supabase, "whatsapp_meta", messageId)`.
- Duplicate Meta delivery returns `200 OK` without re-processing.

## Razorpay (`/api/webhook/razorpay`)

| Header | `x-razorpay-signature` |
| Secret | `RAZORPAY_WEBHOOK_SECRET` |
| Body | Raw JSON text (not re-serialized) |

- Missing secret → `500 Server misconfigured`.
- Invalid signature → `400 Invalid signature`.
- Idempotency key: `razorpay:{event}:{entity_id}` in `webhook_events`.

## OpenWA (`/api/webhook/openwa`)

- Validates `OPENWA_WEBHOOK_SECRET` header when configured.
- Idempotent via `webhook_events` provider `openwa`.

## Verification SQL

```sql
select provider, count(*) from public.webhook_events group by provider;
```

## Local testing

Set dummy secrets in `.env.local`. Unit tests cover signature helpers in `lib/meta-webhook-signature.test.ts` and `lib/razorpay-webhook-signature.test.ts`.
