begin;

-- 1) Table
create table if not exists public.auth_sync (
  device_id uuid primary key,
  access_token text not null,
  refresh_token text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint auth_sync_expires_after_created check (expires_at > created_at)
);

-- 2) Index
create index if not exists auth_sync_expires_at_idx
  on public.auth_sync (expires_at);

-- 3) RLS: enable and lock to service_role only
alter table public.auth_sync enable row level security;

-- Drop old policy if it exists, then recreate
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'auth_sync' and policyname = 'service role only'
  ) then
    execute 'drop policy "service role only" on public.auth_sync';
  end if;
end$$;

create policy "service role only"
  on public.auth_sync
  as permissive
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 4) Cleanup job: hourly purge of expired rows
create extension if not exists pg_cron with schema extensions;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'auth_sync_purge_hourly') then
    perform cron.unschedule('auth_sync_purge_hourly');
  end if;

  perform cron.schedule(
    'auth_sync_purge_hourly',
    '0 * * * *',  -- every hour
    'delete from public.auth_sync where expires_at < now();'
  );
exception
  when undefined_table or insufficient_privilege then
    -- If pg_cron is not available for this role, run the DELETE externally
    null;
end$$;

commit;
