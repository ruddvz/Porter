-- Product fields for dashboard / catalog (Session 5 alignment)
-- Order status: preparing (kanban alignment)

alter table public.products
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists stock_quantity int not null default 1 check (stock_quantity >= 0);

-- Backfill from legacy in_stock flag
update public.products
set
  is_active = in_stock,
  stock_quantity = case when in_stock then greatest(stock_quantity, 1) else 0 end;

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
