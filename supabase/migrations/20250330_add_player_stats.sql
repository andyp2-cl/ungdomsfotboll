
-- Add player_stats column to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS player_stats JSONB;

COMMENT ON COLUMN activities.player_stats IS 'JSON containing player statistics like goals scored';
