-- Add participants column to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS participants text[] DEFAULT '{}';

-- Migrate existing data from player_activities to participants array
WITH player_activity_data AS (
  SELECT activity_id, array_agg(player_id) as player_ids
  FROM player_activities
  GROUP BY activity_id
)
UPDATE activities a
SET participants = pad.player_ids
FROM player_activity_data pad
WHERE a.id = pad.activity_id;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_activities_participants ON activities USING GIN (participants);

-- Add comment
COMMENT ON COLUMN activities.participants IS 'Array of player IDs participating in this activity'; 