-- Delivery extras + bot off-hours (Phase 2)

alter table public.sellers
  add column if not exists timezone text default 'Asia/Kolkata',
  add column if not exists min_order_amount numeric,
  add column if not exists delivery_fee numeric,
  add column if not exists off_hours_message text;

comment on column public.sellers.timezone is 'IANA timezone for working_hours evaluation.';
comment on column public.sellers.min_order_amount is 'Minimum cart total (₹) before placing order.';
comment on column public.sellers.delivery_fee is 'Flat delivery fee (₹) for receipts/settings.';
comment on column public.sellers.off_hours_message is 'WhatsApp auto-reply when outside working_hours.';
