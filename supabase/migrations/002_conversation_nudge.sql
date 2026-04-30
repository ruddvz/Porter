-- Abandoned conversation nudges (cron)
alter table public.conversations
  add column if not exists nudge_count int not null default 0,
  add column if not exists last_nudge_at timestamptz;
