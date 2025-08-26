-- Create the log table (run this first)
CREATE TABLE IF NOT EXISTS public.daily_email_log (
  user_id uuid NOT NULL,
  tz text NOT NULL,
  sent_on date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tz, sent_on)
);

-- Set up RPC
CREATE OR REPLACE FUNCTION public.claim_profiles_for_daily_email(p_window int DEFAULT 2)
RETURNS TABLE (
  user_id uuid,
  email text,
  timezone text,
  local_day date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  -- Target local hour for notifications
  v_target_hour int := 11;
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT
      p.user_id,
      (u.email)::text AS email,
      COALESCE(p.timezone, 'UTC') AS timezone,
      (now() AT TIME ZONE COALESCE(p.timezone, 'UTC'))::date AS local_day
    FROM public.profile p
    JOIN auth.users u
      ON u.id = p.user_id
    WHERE
      -- Temporarily limit to Australia timezones due to vercel cron job limit
      COALESCE(p.timezone, '') ILIKE 'Australia/%'
      AND (now() AT TIME ZONE COALESCE(p.timezone, 'UTC'))::time < make_time(v_target_hour, 0, 0)
      AND (now() AT TIME ZONE COALESCE(p.timezone, 'UTC'))::time >= make_time(v_target_hour - p_window, 0, 0)
  ),
  claimed AS (
    INSERT INTO public.daily_email_log AS d (user_id, tz, sent_on)
    SELECT c.user_id, c.timezone, c.local_day
    FROM candidates c
    ON CONFLICT ON CONSTRAINT daily_email_log_pkey DO NOTHING
    RETURNING
      d.user_id,
      d.tz AS timezone,
      d.sent_on AS local_day
  )
  SELECT
    c.user_id::uuid,
    c.email::text,
    c.timezone::text,
    c.local_day::date
  FROM candidates c
  JOIN claimed cl
    ON cl.user_id = c.user_id
   AND cl.timezone = c.timezone
   AND cl.local_day = c.local_day;
END
$$;

ALTER FUNCTION public.claim_profiles_for_daily_email(integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.claim_profiles_for_daily_email(integer) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_profiles_for_daily_email(integer) TO service_role;
