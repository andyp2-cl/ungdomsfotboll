-- Add cup_name column to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS cup_name text;

-- Update existing cup matches with cup names from their parent cups
UPDATE activities a
SET cup_name = (
  SELECT c.name
  FROM activities c
  WHERE c.id = a.cup_id
  AND c.type = 'cup'
)
WHERE a.type = 'match'
AND a.cup_id IS NOT NULL; 