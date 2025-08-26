create or replace function public.purge_current_user()
returns void
language plpgsql
security definer
as $$
declare
  uid uuid;
begin
  -- Get the current user's uid from auth context
  uid := auth.uid();

  -- Delete related data
  delete from public.goal where user_id = uid;
  delete from public.profile where user_id = uid;
  delete from public.invite where user_id = uid;
  delete from public.friend where user_a_id = uid or user_b_id = uid;
  delete from public.broadcast where user_id = uid;
  delete from public.daily_email_log where user_id = uid;
  delete from public.user_push_subscriptions where user_id = uid;

  -- Finally, delete from auth.users (requires service_role or function with SECURITY DEFINER)
  delete from auth.users where id = uid;
end;
$$;

-- Reset privileges
revoke all on function public.purge_current_user() from public;
grant execute on function public.purge_current_user() to authenticated;
