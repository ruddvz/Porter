-- Phase 4 + admin realtime: platform_events readable by admins; public order tracking slug; loyalty; broadcasts.

-- Allow platform admins to read platform_events (realtime activity feed in admin UI).
drop policy if exists platform_events_admin_select on public.platform_events;
create policy platform_events_admin_select on public.platform_events
  for select using (public.is_platform_admin());

-- Unguessable slug for public order tracking (no RLS on anon select — app verifies slug).
alter table public.orders
  add column if not exists track_public_slug text;

create unique index if not exists orders_track_public_slug_uidx
  on public.orders (track_public_slug)
  where track_public_slug is not null;

update public.orders
set track_public_slug = encode(gen_random_bytes(12), 'hex')
where track_public_slug is null;

create or replace function public.orders_set_track_slug()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.track_public_slug is null or trim(new.track_public_slug) = '' then
    new.track_public_slug := encode(gen_random_bytes(12), 'hex');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_track_slug_bi on public.orders;
create trigger orders_set_track_slug_bi
  before insert on public.orders
  for each row
  execute function public.orders_set_track_slug();

-- Loyalty (optional per seller): award points when order is delivered.
alter table public.sellers
  add column if not exists loyalty_points_enabled boolean not null default false;

alter table public.customers
  add column if not exists loyalty_points int not null default 0;

-- Broadcast log (seller-initiated blast history).
create table if not exists public.broadcast_messages (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  body text not null,
  recipient_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists broadcast_messages_seller_idx on public.broadcast_messages (seller_id, created_at desc);

alter table public.broadcast_messages enable row level security;

create policy broadcast_messages_select_own on public.broadcast_messages
  for select using (seller_id = public.current_seller_id());

create policy broadcast_messages_insert_own on public.broadcast_messages
  for insert with check (seller_id = public.current_seller_id());

comment on table public.broadcast_messages is 'WhatsApp broadcast sends initiated from seller dashboard.';

create or replace function public.award_loyalty_on_delivered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pts int;
  en boolean;
begin
  if tg_op = 'UPDATE'
     and new.status = 'delivered'
     and (old.status is distinct from 'delivered')
     and new.customer_id is not null
  then
    select s.loyalty_points_enabled into en
    from public.sellers s where s.id = new.seller_id;
    if coalesce(en, false) then
      pts := greatest(0, floor(coalesce(new.total_amount, 0))::int);
      if pts > 0 then
        update public.customers
        set loyalty_points = loyalty_points + pts
        where id = new.customer_id and seller_id = new.seller_id;
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_award_loyalty_on_delivered on public.orders;
create trigger orders_award_loyalty_on_delivered
  after update of status on public.orders
  for each row
  execute function public.award_loyalty_on_delivered();

-- Public track page: safe RPC (no broad anon SELECT on orders).
create or replace function public.get_order_by_track_slug(sl text)
returns table (
  order_id uuid,
  status text,
  payment_status text,
  total_amount numeric,
  created_at timestamptz,
  delivery_area text,
  store_name text,
  city text,
  scheduled_for timestamptz,
  rider_label text
)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.status, o.payment_status, o.total_amount, o.created_at, o.delivery_area,
         s.store_name, s.city,
         o.scheduled_for, o.rider_label
  from public.orders o
  join public.sellers s on s.id = o.seller_id
  where o.track_public_slug = sl
  limit 1;
$$;

revoke all on function public.get_order_by_track_slug(text) from public;
grant execute on function public.get_order_by_track_slug(text) to anon, authenticated;

-- Scheduled pre-orders + optional rider label (dashboard display).
alter table public.orders
  add column if not exists scheduled_for timestamptz,
  add column if not exists rider_label text;

