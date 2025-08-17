ALTER TABLE public.goal
ADD COLUMN IF NOT EXISTS created_date date
GENERATED ALWAYS AS ((created_at AT TIME ZONE 'UTC')::date) STORED;
