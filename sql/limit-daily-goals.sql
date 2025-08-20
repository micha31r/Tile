-- Helpful index (keeps the count fast)
CREATE INDEX IF NOT EXISTS goal_user_created_at_idx
  ON public.goal (user_id, created_at);

-- Trigger function: block insert if 4 already exist for the same user & local date
CREATE OR REPLACE FUNCTION public.limit_daily_goals_utc()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_day date;
  v_count int;
  v_lock_key bigint;
  v_tz text;
BEGIN
  -- Resolve user's timezone (fallback to UTC if missing/NULL)
  SELECT COALESCE(p.timezone, 'UTC')
    INTO v_tz
  FROM public.profile p
  WHERE p.user_id = NEW.user_id;

  -- Work in the user's local date (derived from timestamptz)
  v_day := COALESCE((NEW.created_at AT TIME ZONE v_tz)::date,
                    (now()          AT TIME ZONE v_tz)::date);

  -- Per-(user_id, day) transaction advisory lock to avoid race conditions
  v_lock_key := ('x' || substr(md5(NEW.user_id::text || v_day::text), 1, 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Count existing rows for same user on the same local date
  SELECT COUNT(*)
    INTO v_count
  FROM public.goal g
  WHERE g.user_id = NEW.user_id
    AND (g.created_at AT TIME ZONE v_tz)::date = v_day;

  IF v_count >= 4 THEN
    RAISE EXCEPTION 'Daily limit of 4 reached for user % on % (tz=%)', NEW.user_id, v_day, v_tz
      USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END
$$;

-- Attach trigger to public.goal
DROP TRIGGER IF EXISTS trg_limit_daily_goals_utc ON public.goal;
CREATE TRIGGER trg_limit_daily_goals_utc
BEFORE INSERT ON public.goal
FOR EACH ROW
EXECUTE FUNCTION public.limit_daily_goals_utc();
