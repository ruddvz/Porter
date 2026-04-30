# Porter — WhatsApp dark store SaaS

## Database (Supabase)

1. Link project: `supabase link` (or use Dashboard SQL editor).
2. Run migration: paste `supabase/migrations/001_initial_schema.sql` into **SQL Editor** → Run, or use `supabase db push` if CLI is configured.
3. Optional seed: run `supabase/seed.sql` after you have at least one `auth.users` row (sign up via `/auth/signup`).

## Local dev

Copy `.env.example` to `.env.local` and fill values. Then:

```bash
npm install
npm run dev
```

Webhooks: expose with `ngrok` or Vercel preview; set Meta callback URL to `/api/webhook/whatsapp` and Razorpay webhook to `/api/webhook/razorpay`.
