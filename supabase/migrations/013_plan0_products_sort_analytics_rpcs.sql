-- Plan0: product ordering & alerts, seller conversation access, analytics RPCs

-- Products: persisted sort order + low-stock threshold
alter table public.products add column if not exists sort_order int not null default 0;
alter table public.products add column if not exists min_stock_alert int not null default 5 check (min_stock_alert >= 0);

create index if not exists products_seller_sort_idx on public.products (seller_id, sort_order, created_at desc);

-- Conversations: sellers can read/update own threads (dashboard chat UI)
drop policy if exists conversations_select_own on public.conversations;
create policy conversations_select_own on public.conversations
  for select using (seller_id = public.current_seller_id());

drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own on public.conversations
  for update using (seller_id = public.current_seller_id());

-- Analytics RPCs (SECURITY DEFINER + seller ownership via auth.uid())
create or replace function public.get_revenue_timeseries(p_seller_id uuid, p_start date, p_end date)
returns table (day date, revenue numeric, order_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select (o.created_at at time zone 'utc')::date as day,
         coalesce(sum(o.total_amount), 0)::numeric as revenue,
         count(*)::bigint as order_count
  from public.orders o
  where o.seller_id = p_seller_id
    and o.status <> 'cancelled'
    and (o.created_at at time zone 'utc')::date between p_start and p_end
    and exists (
      select 1 from public.sellers s
      where s.id = p_seller_id and s.user_id = auth.uid()
    )
  group by 1
  order by 1;
$$;

revoke all on function public.get_revenue_timeseries(uuid, date, date) from public;
grant execute on function public.get_revenue_timeseries(uuid, date, date) to authenticated;

create or replace function public.get_orders_by_status_counts(p_seller_id uuid, p_start timestamptz, p_end timestamptz)
returns table (status text, cnt bigint)
language sql
stable
security definer
set search_path = public
as $$
  select o.status::text,
         count(*)::bigint
  from public.orders o
  where o.seller_id = p_seller_id
    and o.created_at >= p_start and o.created_at <= p_end
    and exists (
      select 1 from public.sellers s
      where s.id = p_seller_id and s.user_id = auth.uid()
    )
  group by o.status;
$$;

revoke all on function public.get_orders_by_status_counts(uuid, timestamptz, timestamptz) from public;
grant execute on function public.get_orders_by_status_counts(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.get_top_products_by_revenue(p_seller_id uuid, p_start timestamptz, p_end timestamptz, p_limit int default 8)
returns table (product_name text, revenue numeric, units_sold numeric)
language sql
stable
security definer
set search_path = public
as $$
  select oi.product_name::text,
         coalesce(sum(oi.total_price), 0)::numeric as revenue,
         coalesce(sum(oi.quantity), 0)::numeric as units_sold
  from public.order_items oi
  inner join public.orders o on o.id = oi.order_id
  where o.seller_id = p_seller_id
    and o.created_at >= p_start and o.created_at <= p_end
    and o.status <> 'cancelled'
    and exists (
      select 1 from public.sellers s
      where s.id = p_seller_id and s.user_id = auth.uid()
    )
  group by oi.product_name
  order by revenue desc
  limit greatest(1, least(coalesce(p_limit, 8), 50));
$$;

revoke all on function public.get_top_products_by_revenue(uuid, timestamptz, timestamptz, int) from public;
grant execute on function public.get_top_products_by_revenue(uuid, timestamptz, timestamptz, int) to authenticated;

create or replace function public.get_order_volume_by_hour(p_seller_id uuid, p_start timestamptz, p_end timestamptz)
returns table (hour_of_day int, order_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select extract(hour from (o.created_at at time zone 'utc'))::int as hour_of_day,
         count(*)::bigint
  from public.orders o
  where o.seller_id = p_seller_id
    and o.created_at >= p_start and o.created_at <= p_end
    and exists (
      select 1 from public.sellers s
      where s.id = p_seller_id and s.user_id = auth.uid()
    )
  group by 1
  order by 1;
$$;

revoke all on function public.get_order_volume_by_hour(uuid, timestamptz, timestamptz) from public;
grant execute on function public.get_order_volume_by_hour(uuid, timestamptz, timestamptz) to authenticated;

create or replace function public.get_customer_retention_counts(p_seller_id uuid, p_start timestamptz, p_end timestamptz)
returns table (segment text, customer_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  with phones as (
    select o.customer_phone,
           count(*)::bigint as oc
    from public.orders o
    where o.seller_id = p_seller_id
      and o.created_at >= p_start and o.created_at <= p_end
      and o.status <> 'cancelled'
      and exists (
        select 1 from public.sellers s
        where s.id = p_seller_id and s.user_id = auth.uid()
      )
    group by o.customer_phone
  ),
  labeled as (
    select case when oc = 1 then 'new' else 'returning' end as segment
    from phones
  )
  select segment::text, count(*)::bigint as customer_count
  from labeled
  group by segment;
$$;

revoke all on function public.get_customer_retention_counts(uuid, timestamptz, timestamptz) from public;
grant execute on function public.get_customer_retention_counts(uuid, timestamptz, timestamptz) to authenticated;
