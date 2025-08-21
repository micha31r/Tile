-- Generate test goals for a given date
WITH vars AS (
  SELECT 
    DATE '2025-08-07' AS base_date,
    '969e4ab5-5485-491e-8319-2846461b709f'::uuid AS uid
)
INSERT INTO "public"."goal" 
("created_at", "name", "details", "completed", "reflection", "user_id", "priority") 
VALUES
  ((SELECT base_date + TIME '09:00:00' FROM vars), 'test item 1', null, true, null, (SELECT uid FROM vars), '1'),
  ((SELECT base_date + TIME '09:10:00' FROM vars), 'test item 2', null, true, null, (SELECT uid FROM vars), '2'),
  ((SELECT base_date + TIME '09:20:00' FROM vars), 'test item 3', null, true, null, (SELECT uid FROM vars), '3'),
  ((SELECT base_date + TIME '09:30:00' FROM vars), 'test item 4', null, true, null, (SELECT uid FROM vars), '4');

-- Generate test goals for a given date (named)
WITH vars AS (
  SELECT 
    DATE '2025-08-07' AS base_date,
    '969e4ab5-5485-491e-8319-2846461b709f'::uuid AS uid
)
INSERT INTO "public"."goal" 
("created_at", "name", "details", "completed", "reflection", "user_id", "priority") 
VALUES
  ((SELECT base_date + TIME '09:00:00' FROM vars), 'Complete calculus assignment', null, true, null, (SELECT uid FROM vars), '1'),
  ((SELECT base_date + TIME '09:10:00' FROM vars), 'Do laundry', null, true, null, (SELECT uid FROM vars), '2'),
  ((SELECT base_date + TIME '09:20:00' FROM vars), 'Read for 30 minutes', null, true, null, (SELECT uid FROM vars), '3'),
  ((SELECT base_date + TIME '09:30:00' FROM vars), 'Record a podcast episode', null, true, null, (SELECT uid FROM vars), '4');
