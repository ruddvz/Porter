-- Persist WhatsApp thread lines for seller dashboard (Plan0 §7) + realtime.

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists conversation_messages_conv_created_idx
  on public.conversation_messages (conversation_id, created_at);

create index if not exists conversation_messages_seller_created_idx
  on public.conversation_messages (seller_id, created_at desc);

alter table public.conversation_messages enable row level security;

create policy conversation_messages_select_own on public.conversation_messages
  for select using (seller_id = public.current_seller_id());

create policy conversation_messages_insert_own on public.conversation_messages
  for insert with check (seller_id = public.current_seller_id());

alter table public.conversation_messages replica identity full;

do $$
begin
  execute 'alter publication supabase_realtime add table public.conversation_messages';
exception
  when duplicate_object then null;
  when others then
    raise notice 'Could not add conversation_messages to publication: %', SQLERRM;
end;
$$;
