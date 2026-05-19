-- Porter master plan: public store slug, OpenWA provider, inventory ledger

alter table public.sellers
  add column if not exists store_slug text,
  add column if not exists whatsapp_provider text not null default 'meta'
    check (whatsapp_provider in ('meta', 'openwa')),
  add column if not exists openwa_session_id text,
  add column if not exists openwa_session_status text,
  add column if not exists pickup_enabled boolean not null default true,
  add column if not exists delivery_enabled boolean not null default true;

create unique index if not exists sellers_store_slug_uidx on public.sellers (store_slug)
  where store_slug is not null;

do $$
declare
  r record;
  base_slug text;
  candidate text;
  n int;
begin
  for r in select id, store_name from public.sellers where store_slug is null loop
    base_slug := lower(regexp_replace(trim(r.store_name), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    if base_slug = '' then base_slug := 'store'; end if;
    candidate := base_slug;
    n := 0;
    while exists (select 1 from public.sellers s where s.store_slug = candidate and s.id <> r.id) loop
      n := n + 1;
      candidate := base_slug || '-' || n::text;
    end loop;
    update public.sellers set store_slug = candidate where id = r.id;
  end loop;
end $$;

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  movement_type text not null check (
    movement_type in (
      'stock_received', 'sale', 'reservation', 'reservation_released',
      'manual_adjustment', 'return', 'damage', 'expired', 'transfer', 'correction'
    )
  ),
  quantity_change numeric not null,
  reason text,
  source text,
  order_id uuid references public.orders (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_movements_seller_product_idx
  on public.inventory_movements (seller_id, product_id, created_at desc);

create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  order_id uuid references public.orders (id) on delete cascade,
  quantity numeric not null check (quantity > 0),
  status text not null default 'active' check (status in ('active', 'committed', 'released')),
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create index if not exists stock_reservations_active_idx
  on public.stock_reservations (seller_id, product_id) where status = 'active';

alter table public.inventory_movements enable row level security;
alter table public.stock_reservations enable row level security;

create policy inventory_movements_own on public.inventory_movements
  for all using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

create policy stock_reservations_own on public.stock_reservations
  for all using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

alter table public.orders
  add column if not exists order_source text default 'whatsapp',
  add column if not exists fulfillment_type text check (fulfillment_type in ('pickup', 'delivery'));

create or replace function public.get_public_store_by_slug(sl text)
returns table (
  id uuid, store_name text, store_slug text, store_description text, logo_url text,
  city text, delivery_zones text[], min_order_amount numeric, delivery_fee numeric,
  pickup_enabled boolean, delivery_enabled boolean, cod_enabled boolean
)
language sql stable security definer set search_path = public
as $$
  select s.id, s.store_name, s.store_slug, s.store_description, s.logo_url, s.city,
    s.delivery_zones, s.min_order_amount, s.delivery_fee, s.pickup_enabled, s.delivery_enabled, s.cod_enabled
  from public.sellers s where s.store_slug = sl and s.is_active = true limit 1;
$$;

grant execute on function public.get_public_store_by_slug(text) to anon, authenticated;

create or replace function public.get_public_store_products(sl text)
returns table (
  id uuid, name text, category text, price numeric, unit text, description text,
  image_url text, stock_quantity int, in_stock boolean, sort_order int
)
language sql stable security definer set search_path = public
as $$
  select p.id, p.name, p.category, p.price, p.unit, p.description, p.image_url,
    p.stock_quantity, p.in_stock, p.sort_order
  from public.products p
  join public.sellers s on s.id = p.seller_id
  where s.store_slug = sl and s.is_active = true and p.is_active = true
  order by p.sort_order nulls last, p.name;
$$;

grant execute on function public.get_public_store_products(text) to anon, authenticated;
