create or replace function get_goals_for_month(user_id uuid, start_utc timestamptz, end_utc timestamptz)
returns setof goal as $$
  select * from goal
  where goal.user_id = user_id
    and goal.created_at >= start_utc
    and goal.created_at <= end_utc
  order by goal.created_at asc, goal.priority asc
$$ language sql stable;