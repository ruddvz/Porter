-- Porter internal admin users + audit log (access via service role + RPC gate)

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'support' check (role in ('super_admin', 'support')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists admin_users_user_id_idx on public.admin_users (user_id);

create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_users (id) on delete set null,
  event_type text not null,
  target_seller_id uuid references public.sellers (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists platform_events_created_idx on public.platform_events (created_at desc);

alter table public.admin_users enable row level security;
alter table public.platform_events enable row level security;

-- No policies: anon/authenticated cannot read/write directly; service role bypasses RLS.

-- Allow authenticated users to check if their JWT is linked to an admin row (for middleware / layouts).
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_platform_admin() to service_role;
