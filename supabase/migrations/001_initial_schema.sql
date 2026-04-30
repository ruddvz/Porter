-- Porter: initial schema (sellers, products, customers, orders, conversations)
-- Apply with: supabase db push  OR  paste in SQL editor (Dashboard > SQL)

-- Extensions
create extension if not exists "pgcrypto";

-- Sellers (one row per store; links to Supabase Auth)
create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  store_name text not null,
  whatsapp_number text not null unique,
  city text,
  delivery_zones text[] default '{}',
  upi_id text,
  -- App-layer encryption recommended before insert; stored as text
  razorpay_key_id text,
  razorpay_key_secret text,
  plan text not null default 'starter' check (plan in ('starter', 'growth')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  meta_phone_number_id text,
  meta_access_token text,
  cod_enabled boolean not null default true
);

create index sellers_user_id_idx on public.sellers (user_id);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  name text not null,
  aliases text[] default '{}',
  category text,
  price numeric not null check (price >= 0),
  unit text not null default 'piece',
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_seller_in_stock_idx on public.products (seller_id, in_stock);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  phone_number text not null,
  name text,
  default_area text,
  default_address text,
  order_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (seller_id, phone_number)
);

create index customers_seller_id_idx on public.customers (seller_id);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text,
  customer_phone text not null,
  delivery_area text,
  delivery_address text,
  total_amount numeric,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'paid', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_method text check (payment_method in ('razorpay', 'upi_manual', 'cod')),
  payment_status text default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded', 'cod_pending', 'cod_collected')),
  razorpay_payment_link_id text,
  razorpay_payment_link_url text,
  notes text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz
);

create index orders_seller_status_idx on public.orders (seller_id, status);
create index orders_seller_created_idx on public.orders (seller_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity numeric not null,
  unit text not null,
  unit_price numeric not null,
  total_price numeric not null
);

create index order_items_order_id_idx on public.order_items (order_id);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  customer_phone text not null,
  state text not null default 'collecting_items'
    check (state in (
      'collecting_items',
      'collecting_payment_method',
      'collecting_area',
      'collecting_address',
      'awaiting_payment',
      'complete',
      'failed'
    )),
  context jsonb default '{}',
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index conversations_seller_phone_uidx on public.conversations (seller_id, customer_phone);

-- RLS
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.conversations enable row level security;

-- Helper: current user's seller id
create or replace function public.current_seller_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.sellers where user_id = auth.uid() limit 1;
$$;

-- Sellers: own row only
create policy sellers_select_own on public.sellers
  for select using (user_id = auth.uid());
create policy sellers_update_own on public.sellers
  for update using (user_id = auth.uid());
create policy sellers_insert_own on public.sellers
  for insert with check (user_id = auth.uid());

-- Products
create policy products_all_own on public.products
  for all using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

-- Customers
create policy customers_all_own on public.customers
  for all using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

-- Orders
create policy orders_select_own on public.orders
  for select using (seller_id = public.current_seller_id());
create policy orders_insert_own on public.orders
  for insert with check (seller_id = public.current_seller_id());
create policy orders_update_own on public.orders
  for update using (seller_id = public.current_seller_id());

-- Order items: via parent order
create policy order_items_select_own on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.seller_id = public.current_seller_id()
    )
  );
create policy order_items_insert_own on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.seller_id = public.current_seller_id()
    )
  );
create policy order_items_update_own on public.order_items
  for update using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.seller_id = public.current_seller_id()
    )
  );
create policy order_items_delete_own on public.order_items
  for delete using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.seller_id = public.current_seller_id()
    )
  );

-- Conversations: no policies for authenticated users (service role bypasses RLS)

-- Realtime: add orders to supabase_realtime publication if present (local Supabase includes it)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      execute 'alter publication supabase_realtime add table public.orders';
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;
