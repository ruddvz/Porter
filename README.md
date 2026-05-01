# Porter

**WhatsApp-first dark-store SaaS** — turn natural-language chats into confirmed orders, payment links, and a dashboard your team can run day to day.

---

## 📸 Visuals

> Replace this block with a screenshot or GIF of the marketing site, seller dashboard, or a sample WhatsApp flow.

```text
![Porter demo](docs/screenshots/porter-demo.png)
<!-- Suggested: capture / (marketing), /dashboard (orders), or your WhatsApp mock. -->
```

---

## ✨ Features

- **Conversational ordering** — customers message in plain language (e.g. Gujarati, Hindi, English); the bot guides items, address, and payment.
- **Seller dashboard** — inventory, orders, settings, and realtime-friendly order views.
- **Payments** — Razorpay webhooks and payment links; COD and manual UPI options in the data model.
- **WhatsApp Cloud API** — Meta webhook integration for inbound/outbound commerce flows.
- **AI-assisted understanding** — Google Gemini for richer parsing and responses where configured.
- **Platform admin** — console for sellers, orders, analytics, impersonation, and plan controls.
- **Automation** — Vercel cron for abandoned-conversation nudges (`/api/cron/nudge-abandoned`).
- **Secure backend** — Supabase (Postgres, Auth, RLS) with service-role routes for webhooks and admin operations.

---

## 🚀 Quick Start

```bash
git clone https://github.com/ruddvz/Porter.git
cd porter
cp .env.example .env.local
# Fill every variable in .env.local (Supabase, Gemini, Meta, Razorpay, CRON_SECRET, app URL).

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Webhooks in development** — expose the app with ngrok or a Vercel preview URL, then point:

- Meta WhatsApp callback → `/api/webhook/whatsapp`
- Razorpay → `/api/webhook/razorpay`

### Database (Supabase)

1. Link the project (`supabase link`) or use the Supabase Dashboard **SQL Editor**.
2. Run migrations in order: `supabase/migrations/001_initial_schema.sql`, then `003_admin.sql`, `004_seller_bot_settings.sql`, `005_conversation_nudge.sql`.
   - **Note:** Session 5 was originally `002_conversation_nudge.sql`; that name collided with other `002` files. Use **`005_conversation_nudge.sql`** only. If you already applied the old migration, skip `005` — the `ALTER` is idempotent.
3. Optional: run `supabase/seed.sql` after at least one `auth.users` row exists (e.g. sign up at `/auth/signup`).

**Admin access** — after `003_admin.sql`, insert a row into `public.admin_users` for your Supabase `auth.users.id`. Example (replace UUIDs and email):

```sql
insert into public.admin_users (user_id, email, role)
values ('<your-auth-user-uuid>', 'you@example.com', 'super_admin');
```

The app uses the `is_platform_admin()` RPC for middleware and admin layouts.

**Vercel cron** — set `CRON_SECRET` in the Vercel project. Cron hits `GET /api/cron/nudge-abandoned` with `Authorization: Bearer <CRON_SECRET>` per `vercel.json`. Hobby-tier limits may apply.

---

## 💡 Motivation

Small shops already sell on WhatsApp, but **copy-pasting orders**, **chasing addresses**, and **manual payment follow-up** do not scale. Porter exists to **meet customers where they are**, **structure the conversation into real orders**, and **give merchants one place** to see inventory, payments, and delivery status — without forcing customers onto a separate app first.

---

## 🛠 Tech Stack

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

Per-seller Meta phone IDs, tokens, and Razorpay keys are stored in the `sellers` table (see `.env.example` for global vs. per-tenant configuration).

---

## 🤝 Contributing

1. **Fork** the repository and create a branch from `main` for your change.
2. **Install and verify** — `npm install`, `npm run lint`, and `npm run build` when your change touches app code.
3. **Keep migrations ordered** — append new SQL under `supabase/migrations/` with the next sequence number; document any manual steps in your PR.
4. **Open a pull request** with a short description of the problem, the approach, and any env or Supabase changes reviewers need.
5. **Security** — do not commit secrets; use `.env.local` only on your machine.

Bug reports and small doc fixes are welcome. For larger features, opening an issue first helps align on scope.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).
