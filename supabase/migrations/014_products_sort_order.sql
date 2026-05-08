-- Plan0 §5 — manual sort order for inventory list / drag-to-reorder
alter table public.products add column if not exists sort_order integer not null default 0;

create index if not exists products_seller_sort_order_idx on public.products (seller_id, sort_order);
