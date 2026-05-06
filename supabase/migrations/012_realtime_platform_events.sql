-- Enable Supabase Realtime for platform_events (admin live feed).
-- Safe to run once; may warn if table already in publication.

alter table public.platform_events replica identity full;

do $$
begin
  execute 'alter publication supabase_realtime add table public.platform_events';
exception
  when duplicate_object then null;
  when others then
    raise notice 'Could not add platform_events to publication: %', SQLERRM;
end;
$$;
