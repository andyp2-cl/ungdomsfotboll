-- Add team_id column to existing tables for multi-tenant support

-- Add team_id to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to player_activities table
ALTER TABLE player_activities ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to player_development_history table
ALTER TABLE player_development_history ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to player_ratings table
ALTER TABLE player_ratings ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to training_stats table
ALTER TABLE training_stats ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to training_uploads table
ALTER TABLE training_uploads ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to leagues table
ALTER TABLE leagues ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Add team_id to app_settings table
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);

-- Create indexes for team_id columns
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON activities(team_id);
CREATE INDEX IF NOT EXISTS idx_player_activities_team_id ON player_activities(team_id);
CREATE INDEX IF NOT EXISTS idx_player_development_history_team_id ON player_development_history(team_id);
CREATE INDEX IF NOT EXISTS idx_player_ratings_team_id ON player_ratings(team_id);
CREATE INDEX IF NOT EXISTS idx_training_stats_team_id ON training_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_training_uploads_team_id ON training_uploads(team_id);
CREATE INDEX IF NOT EXISTS idx_leagues_team_id ON leagues(team_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_team_id ON app_settings(team_id);

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_development_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for players
CREATE POLICY "Users can view players in their team" ON players
  FOR SELECT USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can modify players in their team" ON players
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all players" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for activities
CREATE POLICY "Users can view activities in their team" ON activities
  FOR SELECT USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can modify activities in their team" ON activities
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can view all activities" ON activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for other tables (similar pattern)
CREATE POLICY "Users can view player_activities in their team" ON player_activities
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view player_development_history in their team" ON player_development_history
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view player_ratings in their team" ON player_ratings
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view training_stats in their team" ON training_stats
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view training_uploads in their team" ON training_uploads
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view leagues in their team" ON leagues
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view app_settings in their team" ON app_settings
  FOR ALL USING (team_id = (SELECT team_id FROM user_profiles WHERE id = auth.uid()));

-- Admin policies for all tables
CREATE POLICY "Admins can view all player_activities" ON player_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all player_development_history" ON player_development_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all player_ratings" ON player_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all training_stats" ON training_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all training_uploads" ON training_uploads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all leagues" ON leagues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all app_settings" ON app_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  ); 