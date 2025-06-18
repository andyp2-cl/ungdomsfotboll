-- Add status column to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add comment
COMMENT ON COLUMN activities.status IS 'Current status of the activity (e.g. pending, completed, cancelled)';

-- Create an index for faster status-based queries
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities (status);