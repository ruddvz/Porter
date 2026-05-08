# Porter — WhatsApp dark store SaaS

**WhatsApp-first dark-store SaaS** — turn natural-language chats into confirmed orders, payment links, and a dashboard your team can run day to day.

## Live app (this is not GitHub Pages)

If you open **`*.github.io`** for this project, you only see the **static** site from the `docs/` folder. **Dashboards, `/admin`, APIs, and webhooks are all in the Next.js app**, which GitHub Pages cannot run.

**Fastest way to see the real UI:**

1. Click **Deploy on Vercel** on the Pages site, or open [Import this repo on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fruddvz%2FPorter&project-name=porter), sign in, and finish the import.
2. When the build finishes, copy your production URL (for example `https://porter-xxx.vercel.app`).
3. In the Vercel project, open **Settings → Environment Variables** and add every key from [`.env.example`](.env.example). Set **`NEXT_PUBLIC_APP_URL`** to that same production URL (no trailing slash), then **redeploy** so auth and tracking links resolve correctly.
4. Apply Supabase migrations (see [Database (Supabase)](#database-supabase) below) and seed or sign up as needed.

Optional: add a GitHub repository variable **`PORTER_LIVE_URL`** with your production URL (**Settings → Secrets and variables → Actions → Variables**). The next GitHub Pages deploy will show an **Open live app** button on the static landing page.

## Visuals

> Add a screenshot or GIF of the marketing site, seller dashboard, or a sample WhatsApp flow.

```text
![Porter demo](docs/screenshots/porter-demo.png)
```

## Features

- **Conversational ordering** — customers message in plain language (e.g. Gujarati, Hindi, English); the bot guides items, address, and payment.
- **Seller dashboard** — inventory, orders, chats, settings, and realtime-friendly order views.
- **Payments** — Razorpay webhooks and payment links; COD and manual UPI options in the data model.
- **WhatsApp Cloud API** — Meta webhook integration for inbound/outbound commerce flows.
- **AI-assisted understanding** — Google Gemini for richer parsing and responses where configured.
- **Platform admin** — console for sellers, orders, analytics, impersonation, and plan controls.
- **Automation** — Vercel cron for abandoned-conversation nudges (`/api/cron/nudge-abandoned`).
- **Secure backend** — Supabase (Postgres, Auth, RLS) with service-role routes for webhooks and admin operations.

## Quick start

```bash
git clone https://github.com/ruddvz/Porter.git
cd Porter
cp .env.example .env.local
# Fill every variable in .env.local (Supabase, Gemini, Meta, Razorpay, CRON_SECRET, app URL).

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Webhooks in development** — expose the app with ngrok or a Vercel preview URL, then point:

- Meta WhatsApp callback → `/api/webhook/whatsapp`
- Razorpay → `/api/webhook/razorpay`

## Database (Supabase)

1. Link project: `supabase link` (or use Dashboard SQL editor).
2. Run migration: paste `supabase/migrations/001_initial_schema.sql` into **SQL Editor** → Run, or use `supabase db push` if CLI is configured.
3. Apply follow-up migrations in order: `003_admin.sql`, `004_seller_bot_settings.sql`, `005_conversation_nudge.sql`, then **`006_plan_complete.sql`** (full rollout: products + orders `preparing`, seller fields, `platform_settings`, push tables, storage bucket), then **`007_order_items_seller_id.sql`** (denormalizes `seller_id` on `order_items` for realtime line-item updates), then **`008_seller_delivery_extras.sql`** (seller timezone, minimum order, delivery fee, off-hours message), then **`009_order_events.sql`** (`order_events` audit trail + optional `meta_access_token_enc`), then **`010_phase4_platform_events_track_loyalty.sql`**, **`011_referral_codes.sql`**, **`012_realtime_platform_events.sql`** (admin live feed), then **`013_conversation_messages.sql`** (WhatsApp thread persistence + Realtime for seller Chats), then **`014_products_sort_order.sql`** (manual product ordering / drag reorder). If you previously applied **`006_product_fields_and_order_preparing.sql`** only, compare with `006_plan_complete.sql` and apply any missing pieces (do not run duplicate conflicting `ALTER`s blindly).

   **Note:** Session 5 was originally named `002_conversation_nudge.sql`; that collided with other `002` migrations. Use **`005_conversation_nudge.sql`** only. If you already ran the old file, skip `005` — the `ALTER` is idempotent.

### GitHub Pages (static preview)

The `docs/` folder is a small **static** site (no server) you can publish to **GitHub Pages** to show project status and branding. A workflow at `.github/workflows/pages.yml` deploys on pushes to `main` (enable **Settings → Pages → Source: GitHub Actions** in the repo). It is **not** a substitute for running the Next.js app.

4. Optional seed: run `supabase/seed.sql` after you have at least one `auth.users` row (sign up via `/auth/signup`).

### Admin users

After `003_admin.sql`, insert at least one row into `admin_users` linking your Supabase `auth.users.id` so `/admin` is reachable. Example (run in SQL editor, replace UUIDs):

```sql
insert into public.admin_users (user_id, email, role)
values ('<your-auth-user-uuid>', 'you@example.com', 'super_admin');
```

The app uses the `is_platform_admin()` RPC (security definer) for middleware and admin layouts.

### Vercel cron (abandoned nudges)

Set `CRON_SECRET` in Vercel project env. Vercel invokes `GET /api/cron/nudge-abandoned` with `Authorization: Bearer <CRON_SECRET>` on the schedule in `vercel.json`. Hobby tier cron limits may apply when you deploy.

## Local dev

Copy `.env.example` to `.env.local` and fill values. Then:

```bash
npm install
npm run dev
```

**Meta verify token:** set `META_WEBHOOK_VERIFY_TOKEN` in `.env.local` (must match Meta dashboard). You may also set `META_VERIFY_TOKEN` to the same value — the app accepts either for the GET verify handshake. Per-seller WhatsApp API tokens live on the `sellers` row, not in env (see `.env.example`).

**Push:** set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `PUSH_INTERNAL_SECRET` in Vercel for Web Push. **Encryption:** set `PORTER_CREDENTIAL_SECRET` (32+ char random) before using “encrypt at rest” on payment fields.

**Google sign-in:** enable the Google provider in Supabase, add `/auth/callback` to redirect URLs, then set `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true` so seller login and signup show “Continue with Google”.

## Tech stack

| Area | Technologies |
|------|----------------|
| **App framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, PostCSS |
| **Data & auth** | Supabase (PostgreSQL, Row Level Security, SSR auth helpers) |
| **Payments** | Razorpay (webhooks, payment links) |
| **Messaging** | Meta WhatsApp Cloud API |
| **AI** | Google Generative AI (Gemini) |
| **Charts** | Recharts |
| **Search / UX** | Fuse.js, Lucide React |
| **Hosting / ops** | Vercel (`@vercel/functions`, cron) |

## Motivation

Small shops already sell on WhatsApp, but **copy-pasting orders**, **chasing addresses**, and **manual payment follow-up** do not scale. Porter exists to **meet customers where they are**, **structure the conversation into real orders**, and **give merchants one place** to see inventory, payments, and delivery status — without forcing customers onto a separate app first.

## Contributing

1. **Fork** the repository and create a branch from `main` for your change.
2. **Install and verify** — `npm install`, `npm run lint`, and `npm run build` when your change touches app code.
3. **Keep migrations ordered** — append new SQL under `supabase/migrations/` with the next sequence number; document any manual steps in your PR.
4. **Open a pull request** with a short description of the problem, the approach, and any env or Supabase changes reviewers need.
5. **Security** — do not commit secrets; use `.env.local` only on your machine.

Bug reports and small doc fixes are welcome. For larger features, opening an issue first helps align on scope.

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).
