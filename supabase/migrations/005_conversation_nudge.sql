-- Session 5: Abandoned conversation nudges (cron)
-- Renamed from 002_* to 005_* so this does not collide with other local `002_*.sql` migrations.
alter table public.conversations
  add column if not exists nudge_count int not null default 0,
  add column if not exists last_nudge_at timestamptz;
