-- Simple referral codes for Growth sellers (optional MVP).

alter table public.sellers
  add column if not exists referral_code text;

create unique index if not exists sellers_referral_code_uidx
  on public.sellers (referral_code)
  where referral_code is not null;

alter table public.customers
  add column if not exists referred_by_code text;

comment on column public.sellers.referral_code is 'Optional short code for referrals (Growth).';
comment on column public.customers.referred_by_code is 'Referral code supplied by customer at signup/order (best-effort).';
