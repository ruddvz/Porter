-- Categories table + product slugs (master plan §7)

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (seller_id, slug)
);

create index if not exists categories_seller_idx on public.categories (seller_id, sort_order);

alter table public.products
  add column if not exists category_id uuid references public.categories (id) on delete set null,
  add column if not exists product_slug text,
  add column if not exists low_stock_threshold int not null default 5;

create unique index if not exists products_seller_slug_uidx
  on public.products (seller_id, product_slug)
  where product_slug is not null;

-- Backfill categories from distinct product.category text
do $$
declare
  r record;
  cat_id uuid;
  base_slug text;
begin
  for r in
    select distinct p.seller_id, trim(p.category) as cat_name
    from public.products p
    where p.category is not null and trim(p.category) <> ''
  loop
    base_slug := lower(regexp_replace(r.cat_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from coalesce(nullif(base_slug, ''), 'general'));
    insert into public.categories (seller_id, name, slug)
    values (r.seller_id, r.cat_name, base_slug)
    on conflict (seller_id, slug) do nothing
    returning id into cat_id;
    if cat_id is null then
      select id into cat_id from public.categories where seller_id = r.seller_id and slug = base_slug;
    end if;
    update public.products
    set category_id = cat_id
    where seller_id = r.seller_id and trim(category) = r.cat_name and category_id is null;
  end loop;
end $$;

-- Backfill product_slug from name
do $$
declare
  r record;
  base_slug text;
  candidate text;
  n int;
begin
  for r in select id, seller_id, name from public.products where product_slug is null loop
    base_slug := lower(regexp_replace(trim(r.name), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from coalesce(nullif(base_slug, ''), 'item'));
    candidate := base_slug;
    n := 0;
    while exists (
      select 1 from public.products p
      where p.seller_id = r.seller_id and p.product_slug = candidate and p.id <> r.id
    ) loop
      n := n + 1;
      candidate := base_slug || '-' || n::text;
    end loop;
    update public.products set product_slug = candidate where id = r.id;
  end loop;
end $$;

alter table public.categories enable row level security;

create policy categories_own on public.categories
  for all using (seller_id = public.current_seller_id())
  with check (seller_id = public.current_seller_id());

-- Extend public products RPC to include slug + category
create or replace function public.get_public_store_products(sl text)
returns table (
  id uuid,
  name text,
  product_slug text,
  category text,
  category_slug text,
  price numeric,
  unit text,
  description text,
  image_url text,
  stock_quantity int,
  in_stock boolean,
  sort_order int
)
language sql stable security definer set search_path = public
as $$
  select
    p.id,
    p.name,
    p.product_slug,
    coalesce(c.name, p.category) as category,
    c.slug as category_slug,
    p.price,
    p.unit,
    p.description,
    p.image_url,
    p.stock_quantity,
    p.in_stock,
    p.sort_order
  from public.products p
  join public.sellers s on s.id = p.seller_id
  left join public.categories c on c.id = p.category_id
  where s.store_slug = sl and s.is_active = true and p.is_active = true
  order by p.sort_order nulls last, p.name;
$$;

grant execute on function public.get_public_store_products(text) to anon, authenticated;

create or replace function public.get_public_store_categories(sl text)
returns table (id uuid, name text, slug text, sort_order int)
language sql stable security definer set search_path = public
as $$
  select c.id, c.name, c.slug, c.sort_order
  from public.categories c
  join public.sellers s on s.id = c.seller_id
  where s.store_slug = sl and s.is_active = true and c.is_active = true
  order by c.sort_order, c.name;
$$;

grant execute on function public.get_public_store_categories(text) to anon, authenticated;
