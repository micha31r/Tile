create table if not exists public.user_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,                    -- subscription.endpoint
  p256dh text not null,                      -- subscription.keys.p256dh
  auth text not null,                        -- subscription.keys.auth
  ua text,                                   -- optional: user agent
  platform text,                             -- optional: ios/android/desktop
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists user_push_subscriptions_endpoint_key
  on public.user_push_subscriptions(endpoint);

-- RLS
alter table public.user_push_subscriptions enable row level security;

drop policy if exists "Owner can manage own subs" ON public.user_push_subscriptions;
create policy "Owner can manage own subs"
on public.user_push_subscriptions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- Getting friends' subscriptions
create index if not exists friend_user_a_idx on public.friend (user_a_id);
create index if not exists friend_user_b_idx on public.friend (user_b_id);
create index if not exists ups_user_id_idx on public.user_push_subscriptions (user_id);

create or replace function public.get_friend_subscriptions(actor uuid)
returns table (
  user_id uuid,
  endpoint text,
  p256dh text,
  auth text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- ensure only the logged-in user can query their own friend graph
  if actor is distinct from auth.uid() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  return query
  with friend_ids as (
    select case
             when f.user_a_id = actor then f.user_b_id
             else f.user_a_id
           end as friend_id
    from public.friend f
    where f.user_a_id = actor or f.user_b_id = actor
  )
  select s.user_id, s.endpoint, s.p256dh, s.auth
  from public.user_push_subscriptions s
  join friend_ids fi on fi.friend_id = s.user_id
  where s.revoked_at is null;
end;
$$;

revoke all on function public.get_friend_subscriptions(uuid) from public;
grant execute on function public.get_friend_subscriptions(uuid) to authenticated;
