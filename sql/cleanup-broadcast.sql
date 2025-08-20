-- 1) Ensure pg_cron is available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2) Helpful index for fast time-based deletes
CREATE INDEX IF NOT EXISTS broadcast_created_at_idx
  ON public.broadcast (created_at);

-- 3) Cleanup function: delete broadcasts older than 24 hours
CREATE OR REPLACE FUNCTION public.cleanup_old_broadcasts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.broadcast
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 4) (Re)create an hourly cron job to run the cleanup
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'broadcast_cleanup_hourly') THEN
    PERFORM cron.unschedule('broadcast_cleanup_hourly');
  END IF;

  PERFORM cron.schedule(
    'broadcast_cleanup_hourly',          -- unique job name
    '0 * * * *',                         -- every hour, on the hour
    'SELECT public.cleanup_old_broadcasts();'
  );
END
$$;
