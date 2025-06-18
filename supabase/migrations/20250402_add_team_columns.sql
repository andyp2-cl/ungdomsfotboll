-- Add home_team and away_team columns to activities table
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS home_team TEXT,
ADD COLUMN IF NOT EXISTS away_team TEXT;

COMMENT ON COLUMN activities.home_team IS 'Home team name in a match';
COMMENT ON COLUMN activities.away_team IS 'Away team name in a match'; 