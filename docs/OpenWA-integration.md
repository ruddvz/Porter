# OpenWA + Porter Integration

Porter can use **[OpenWA](https://github.com/rmyndharis/OpenWA)** as a self-hosted WhatsApp gateway instead of Meta’s per-conversation Cloud API billing.

## Architecture

```
Customer WhatsApp  ↔  OpenWA (Docker)  ↔  Porter /api/webhook/openwa
                              ↕
                    Porter sends via OpenWA REST API
```

Each seller gets one OpenWA **session**. Porter stores `openwa_session_id` on the `sellers` row and sets `whatsapp_provider = 'openwa'`.

## 1. Run OpenWA

```bash
# From Porter repo root
docker compose -f docker-compose.openwa.yml up -d
```

Default ports:

- API: `http://localhost:2785`
- Dashboard: `http://localhost:2886`

Set in Porter `.env`:

```env
OPENWA_API_URL=http://localhost:2785
OPENWA_API_KEY=your-master-api-key
OPENWA_WEBHOOK_SECRET=porter-openwa-secret
```

Create an API key in the OpenWA dashboard (or set `API_MASTER_KEY` in OpenWA’s env).

## 2. Connect a store (seller dashboard)

1. Settings → **WhatsApp** tab
2. Choose **OpenWA (self-hosted, no per-message fees)**
3. Click **Create / connect session** — scan QR in the modal
4. Porter registers a webhook on that session pointing to:

   `{NEXT_PUBLIC_APP_URL}/api/webhook/openwa`

## 3. Meta fallback

Stores with an approved Meta WABA can keep `whatsapp_provider = 'meta'` and use the existing Meta webhook at `/api/webhook/whatsapp`.

## 4. Production notes

- Run OpenWA on a persistent VM or container platform with volume mounts for `data/sessions`.
- Use OpenWA’s `postgres` profile for production DB.
- WhatsApp Web automation may violate Meta ToS for some use cases — disclose to merchants and monitor session bans.
- Rate-limit outbound broadcasts; OpenWA enforces its own limits.

## API reference (Porter wrappers)

| Porter route | Purpose |
|--------------|---------|
| `GET/POST /api/seller/openwa` | Session status, create, start, QR |
| `POST /api/webhook/openwa` | Incoming messages from OpenWA |

OpenWA upstream docs: `https://github.com/rmyndharis/OpenWA` → `/docs/06-api-specification.md`
