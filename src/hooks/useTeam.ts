import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Team, UserProfile, CreateTeamData, UpdateTeamData } from '@/types/team';
import { useAuth } from '@/integrations/supabase/auth';

export function useTeam() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and team data
  useEffect(() => {
    if (!user) {
      setTeam(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    async function fetchTeamData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setError('Failed to load user profile');
          return;
        }

        setUserProfile(profile);

        // If user has a team, fetch team data
        if (profile.team_id) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', profile.team_id)
            .single();

          if (teamError) {
            console.error('Error fetching team:', teamError);
            setError('Failed to load team data');
            return;
          }

          setTeam(teamData);
        }
      } catch (err) {
        console.error('Error in fetchTeamData:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [user]);

  // Create a new team
  const createTeam = async (teamData: CreateTeamData): Promise<Team | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team:', error);
        throw error;
      }

      // Update user profile with team_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ team_id: data.id })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating user profile:', profileError);
        throw profileError;
      }

      setTeam(data);
      setUserProfile(prev => prev ? { ...prev, team_id: data.id } : null);

      return data;
    } catch (err) {
      console.error('Error in createTeam:', err);
      throw err;
    }
  };

  // Update team
  const updateTeam = async (updates: UpdateTeamData): Promise<Team | null> => {
    if (!team) return null;

    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', team.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team:', error);
        throw error;
      }

      setTeam(data);
      return data;
    } catch (err) {
      console.error('Error in updateTeam:', err);
      throw err;
    }
  };

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin';

  // Check if user is coach
  const isCoach = userProfile?.role === 'coach';

  // Get team branding
  const getTeamBranding = () => {
    if (!team) return null;
    
    return {
      primary: team.primary_color,
      secondary: team.secondary_color,
      logo: team.logo_url,
    };
  };

  return {
    team,
    userProfile,
    loading,
    error,
    createTeam,
    updateTeam,
    isAdmin,
    isCoach,
    getTeamBranding,
    refetch: () => {
      setLoading(true);
      // Trigger useEffect by updating a dependency
    },
  };
} 