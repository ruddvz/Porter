-- Denormalize seller_id onto order_items for Realtime filters (dashboard merges line items immediately).

alter table public.order_items
  add column if not exists seller_id uuid references public.sellers (id) on delete cascade;

create index if not exists order_items_seller_id_idx on public.order_items (seller_id);

update public.order_items oi
set seller_id = o.seller_id
from public.orders o
where oi.order_id = o.id and (oi.seller_id is null or oi.seller_id <> o.seller_id);

alter table public.order_items alter column seller_id set not null;

create or replace function public.sync_order_item_seller()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select o.seller_id into strict new.seller_id
  from public.orders o
  where o.id = new.order_id;
  return new;
end;
$$;

drop trigger if exists trg_order_items_sync_seller on public.order_items;
create trigger trg_order_items_sync_seller
  before insert or update of order_id on public.order_items
  for each row execute procedure public.sync_order_item_seller();
