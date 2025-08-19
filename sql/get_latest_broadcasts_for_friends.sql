-- Get the most recent broadcast for each user in a list, within the last day
create or replace function get_latest_broadcasts_for_friends(friend_ids uuid[], since timestamptz)
returns table (
  id uuid,
  user_id uuid,
  payload jsonb,
  created_at timestamptz
) as $$
  select distinct on (user_id) id, user_id, payload, created_at
  from broadcast
  where user_id = any(friend_ids)
    and created_at >= since
  order by user_id, created_at desc;
$$ language sql stable;
