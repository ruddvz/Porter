-- Porter master plan: catalog, seller profile, push, platform config, storage bucket

-- Products: extended catalog + bot visibility
alter table public.products
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists stock_quantity int not null default 1 check (stock_quantity >= 0);

update public.products
set
  is_active = in_stock,
  stock_quantity = case when in_stock then greatest(stock_quantity, 1) else 0 end;

alter table public.orders
  add column if not exists razorpay_order_id text;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check check (
    status in (
      'pending',
      'confirmed',
      'preparing',
      'paid',
      'out_for_delivery',
      'delivered',
      'cancelled'
    )
  );

-- Sellers: storefront + bot templates + hours + encrypted-at-rest helpers (app stores ciphertext in *_enc columns when key set)
alter table public.sellers
  add column if not exists store_description text,
  add column if not exists logo_url text,
  add column if not exists bot_out_of_stock_message text,
  add column if not exists bot_order_confirmation_template text,
  add column if not exists working_hours jsonb default '{}'::jsonb,
  add column if not exists upi_id_enc text,
  add column if not exists razorpay_key_id_enc text,
  add column if not exists razorpay_key_secret_enc text;

-- Platform-wide config (single row)
create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),
  starter_product_limit int not null default 50,
  starter_orders_per_month int not null default 200,
  starter_analytics_days int not null default 30,
  growth_analytics_days int not null default 365,
  announcement text,
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (id) values (1) on conflict do nothing;

alter table public.platform_settings enable row level security;

-- Push subscriptions (Web Push) — sellers
create table if not exists public.seller_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (seller_id, endpoint)
);

create index if not exists seller_push_seller_idx on public.seller_push_subscriptions (seller_id);

alter table public.seller_push_subscriptions enable row level security;

create policy seller_push_own on public.seller_push_subscriptions
  for all using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

-- Admin push subscriptions
create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (admin_user_id, endpoint)
);

create index if not exists admin_push_admin_idx on public.admin_push_subscriptions (admin_user_id);

alter table public.admin_push_subscriptions enable row level security;

-- Storage: product images bucket (public read; uploads under {auth.uid()}/...)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images read" on storage.objects;
create policy "product images read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product images upload own" on storage.objects;
create policy "product images upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "product images update own" on storage.objects;
create policy "product images update own"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "product images delete own" on storage.objects;
create policy "product images delete own"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );
