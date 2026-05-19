alter table public.sellers
  add column if not exists auto_commit_inventory_on_payment boolean not null default false;
