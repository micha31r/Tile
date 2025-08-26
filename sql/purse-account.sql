create or replace function public.purge_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated.';
  end if;

  -- Remove rows that reference the user
  delete from public.goal where user_id = uid;
  delete from public.profile where user_id = uid;
  delete from public.invite where user_id = uid;
  delete from public.friend where user_a_id = uid or user_b_id = uid;
  delete from public.broadcast where user_id = uid;
  delete from public.daily_email_log where user_id = uid;
  delete from public.user_push_subscriptions where user_id = uid;
  
  -- Finally remove the Auth user
  perform auth.delete_user(uid);
end;
$$;

-- Allow any authenticated user to call it for themselves
revoke all on function public.purge_current_user() from public;
grant execute on function public.purge_current_user() to authenticated;
