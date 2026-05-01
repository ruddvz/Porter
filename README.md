# Porter — WhatsApp dark store SaaS

## Database (Supabase)

1. Link project: `supabase link` (or use Dashboard SQL editor).
2. Run migration: paste `supabase/migrations/001_initial_schema.sql` into **SQL Editor** → Run, or use `supabase db push` if CLI is configured.
3. Apply follow-up migrations in order: `003_admin.sql`, `004_seller_bot_settings.sql`, `005_conversation_nudge.sql`, **`006_plan_complete.sql`** (products, orders `preparing`, seller fields, `platform_settings`, push tables, storage bucket).  
   **Note:** Session 5 was originally named `002_conversation_nudge.sql`; that collided with other `002` migrations. Use **`005_conversation_nudge.sql`** only. If you already ran the old file, skip `005` — the `ALTER` is idempotent.
4. Optional seed: run `supabase/seed.sql` after you have at least one `auth.users` row (sign up via `/auth/signup`).

### Admin users

After `003_admin.sql`, insert at least one row into `admin_users` linking your Supabase `auth.users.id` so `/admin` is reachable. Example (run in SQL editor, replace UUIDs):

```sql
insert into public.admin_users (user_id, email, role)
values ('<your-auth-user-uuid>', 'you@example.com', 'super_admin');
```

The app uses the `is_platform_admin()` RPC (security definer) for middleware and layouts.

### Vercel cron (abandoned nudges)

Set `CRON_SECRET` in Vercel project env. Vercel invokes `GET /api/cron/nudge-abandoned` with `Authorization: Bearer <CRON_SECRET>` on the schedule in `vercel.json`. Hobby tier cron limits may apply when you deploy.

## Local dev

Copy `.env.example` to `.env.local` and fill values. Then:

```bash
npm install
npm run dev
```

Webhooks: expose with `ngrok` or Vercel preview; set Meta callback URL to `/api/webhook/whatsapp` and Razorpay webhook to `/api/webhook/razorpay`.

**Push:** set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `PUSH_INTERNAL_SECRET` in Vercel for Web Push. **Encryption:** set `PORTER_CREDENTIAL_SECRET` (32+ char random) before using “encrypt at rest” on payment fields.
