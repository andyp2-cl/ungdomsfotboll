-- Restore the IFÖ Bromölla cup
INSERT INTO activities (
  id,
  name,
  type,
  date,
  player_stats
)
VALUES (
  gen_random_uuid(),
  'IFÖ Bromölla',
  'cup',
  '2025-06-27',
  jsonb_build_object(
    'goals', '{}',
    'assists', '{}',
    'cup_matches', '[]'
  )
)
RETURNING id INTO cup_id;

-- Restore the cup matches (we'll need to recreate them with new IDs)
INSERT INTO activities (
  id,
  name,
  type,
  date,
  cup_id,
  cup_name,
  player_stats
)
VALUES 
  (
    gen_random_uuid(),
    'Match 1 - IFÖ Bromölla',
    'match',
    '2025-06-27',
    cup_id,
    'IFÖ Bromölla',
    jsonb_build_object(
      'goals', '{}',
      'assists', '{}',
      'cup_matches', '[]',
      'cup_name', 'IFÖ Bromölla'
    )
  );

-- Update the cup's player_stats to include the new match IDs
UPDATE activities a
SET player_stats = jsonb_set(
  a.player_stats,
  '{cup_matches}',
  (
    SELECT jsonb_agg(m.id)
    FROM activities m
    WHERE m.cup_id = a.id
  )
)
WHERE a.type = 'cup'
AND a.name = 'IFÖ Bromölla'; 