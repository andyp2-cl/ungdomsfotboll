-- Create teams table for multi-tenant structure
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#1E40AF',
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE teams IS 'Teams table for multi-tenant structure';
COMMENT ON COLUMN teams.name IS 'Unique team name';
COMMENT ON COLUMN teams.status IS 'Team approval status: pending, approved, rejected';
COMMENT ON COLUMN teams.primary_color IS 'Primary brand color in hex format';
COMMENT ON COLUMN teams.secondary_color IS 'Secondary brand color in hex format';

-- Create indexes
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_created_by ON teams(created_by);
CREATE INDEX idx_teams_name ON teams(name);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own team" ON teams
  FOR SELECT USING (id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all teams" ON teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own team" ON teams
  FOR UPDATE USING (id = (SELECT team_id FROM user_profiles WHERE id = auth.uid())); 