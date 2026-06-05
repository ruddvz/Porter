# Security review (post-audit)

## Headers (`next.config.mjs`)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restricts camera/mic/geo
- `poweredByHeader: false`

CSP is intentionally not strict yet — Razorpay checkout, Supabase, and fonts need a dedicated pass before tightening.

## Authentication boundaries

| Area | Protection |
|------|------------|
| `/dashboard/*` | Supabase session; middleware redirect |
| `/admin/*` | `admin_users` + `is_platform_admin()` |
| `/api/seller/*` | Session + seller row |
| `/api/admin/*` | Admin session |
| `/api/internal/*`, cron | `CRON_SECRET` / internal secrets |
| `/api/public/*` | Slug-scoped, no PII leak |
| Webhooks | Signatures + idempotency |

## Secrets (see `.env.example`)

| Variable | Use |
|----------|-----|
| `PORTER_IMPERSONATION_SECRET` | HMAC admin impersonation cookie |
| `META_APP_SECRET` | Meta webhook POST signature |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signature |
| `PUSH_INTERNAL_SECRET` | Server-to-server push |
| `CRON_SECRET` | Vercel cron routes |
| `PORTER_CREDENTIAL_SECRET` | Encrypt seller payment fields |

Production routes fail closed when required secrets are missing (webhooks, impersonation signing).

## Admin impersonation

- Route: `POST/DELETE /api/admin/impersonate`
- Cookie: HttpOnly, `Secure` in production, `SameSite=Lax`, 4h max age
- Platform event logged on start/end
- Unit tests: `lib/impersonation-cookie.test.ts`

## CI

GitHub Actions uses dummy env values only — no production secrets. See `.github/workflows/verify.yml`.
