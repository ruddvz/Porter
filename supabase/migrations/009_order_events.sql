-- Order audit trail for dashboard + bot (Phase 3)

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  seller_id uuid not null references public.sellers (id) on delete cascade,
  event_type text not null,
  status text,
  payment_status text,
  note text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id_idx on public.order_events (order_id);
create index if not exists order_events_seller_id_idx on public.order_events (seller_id);

alter table public.order_events enable row level security;

create policy order_events_select_own on public.order_events
  for select using (seller_id = public.current_seller_id());

create policy order_events_insert_own on public.order_events
  for insert with check (seller_id = public.current_seller_id());

alter table public.sellers
  add column if not exists meta_access_token_enc text;

comment on column public.sellers.meta_access_token_enc is 'AES-GCM ciphertext when Meta token encrypted at rest.';
