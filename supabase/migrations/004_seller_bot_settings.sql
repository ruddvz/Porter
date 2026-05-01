-- Seller-configurable bot copy + language preference + Razorpay test mode flag
alter table public.sellers
  add column if not exists bot_intro_message text,
  add column if not exists bot_language text not null default 'auto',
  add column if not exists razorpay_test_mode boolean not null default false;
