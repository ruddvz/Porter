-- Idempotent webhook processing (duplicate delivery safe)
create table if not exists public.webhook_events (
  id text primary key,
  provider text not null,
  external_event_id text not null,
  received_at timestamptz not null default now()
);

create index if not exists webhook_events_provider_received_idx
  on public.webhook_events (provider, received_at desc);

alter table public.webhook_events enable row level security;

-- No policies: service role only via API routes
