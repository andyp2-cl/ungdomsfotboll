
-- Add match report and YouTube link columns to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS match_report TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS youtube_link TEXT;

-- Comment on the new columns
COMMENT ON COLUMN activities.match_report IS 'Text report/summary of the match';
COMMENT ON COLUMN activities.youtube_link IS 'Link to YouTube video of the match';

-- Update existing activities to have null values for these columns if they don't exist
UPDATE activities SET match_report = NULL WHERE match_report IS NULL;
UPDATE activities SET youtube_link = NULL WHERE youtube_link IS NULL;
