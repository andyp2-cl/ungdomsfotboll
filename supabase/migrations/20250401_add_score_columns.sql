
-- Add homeScore and awayScore columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS home_score INTEGER,
ADD COLUMN IF NOT EXISTS away_score INTEGER;

COMMENT ON COLUMN activities.home_score IS 'Home team score in a match';
COMMENT ON COLUMN activities.away_score IS 'Away team score in a match';
