-- Get the ID of the new cup
WITH new_cup AS (
  SELECT id 
  FROM activities 
  WHERE name = 'IFÖ Bromölla' 
  AND type = 'cup' 
  ORDER BY created_at DESC 
  LIMIT 1
)
-- Update all matches that were linked to the old cup
UPDATE activities a
SET 
  deleted_at = NULL,  -- Restore soft-deleted matches
  cup_id = (SELECT id FROM new_cup),
  cup_name = 'IFÖ Bromölla',
  player_stats = jsonb_set(
    COALESCE(a.player_stats, '{}'::jsonb),
    '{cup_name}',
    '"IFÖ Bromölla"'
  )
WHERE a.type = 'match'
AND a.deleted_at IS NOT NULL  -- Only restore deleted matches
AND a.deleted_at > NOW() - INTERVAL '1 hour';  -- Only from the last hour to be safe 