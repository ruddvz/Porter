# Plan 0 — Manual tasks (operator checklist)

These items cannot be completed purely in code in this repo, or depend on **your** accounts, assets, and QA judgment. Complete them when preparing production.

## Assets and marketing

1. **PWA manifest screenshots** — Capture stable desktop (`1280×800`) and mobile (`390×844`) shots of the seller dashboard or marketing site; add paths under `public/screenshots/` and wire them into `public/manifest.json` per Plan0 §1.1.

2. **Dedicated maskable icons** — Replace or pad icons per size so maskable safe-zone guidelines are met (avoid cropping the logo on Android adaptive icons).

3. **Optional: Arabic / RTL stack** — Plan0 mentions Noto Naskh Arabic for previews; the product is India-first and this remains optional.

## Third-party dashboards

4. **Supabase Auth** — Enable **Google** (if used), email templates, and redirect URLs including `{YOUR_APP_URL}/auth/callback`.

5. **Supabase project** — Apply new migrations from git (e.g. `014_products_sort_order.sql`) via CLI or SQL Editor on every environment.

6. **Meta WhatsApp Cloud API** — Verify production webhook, tokens, and phone number IDs outside the app.

7. **Razorpay** — Production keys, webhook URL, and signature secret in the live project.

8. **Vercel / hosting** — Env vars: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_INTERNAL_SECRET`, `PORTER_CREDENTIAL_SECRET`, `CRON_SECRET`, etc.

## Process and quality

9. **GitHub milestone / issues** — Track remaining polish (Lighthouse, WCAG audit, pixel diff vs Plan0 wireframes) as discrete issues.

10. **Security review** — Periodic RLS review, secret rotation, and webhook replay checks (see README).

11. **Service worker scope** — Document for your team why seller SW registration is dashboard-scoped vs other areas (if you add more surfaces later).

12. **Load / uptime monitors** — Point probes at `/api/health` if you rely on its `{ ok: true }` shape (unchanged for compatibility).

---

When you finish an item, update [Plan0-implementation-status.md](Plan0-implementation-status.md) so the living matrix stays accurate.
