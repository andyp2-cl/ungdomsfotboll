import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Team, UserProfile } from '@/types/team';
import { useAuth } from '@/integrations/supabase/auth';

export interface TeamWithUsers extends Team {
  user_profiles: UserProfile[];
}

export function useAdmin() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all teams with user profiles
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('teams')
        .select(`
          *,
          user_profiles (*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching teams:', fetchError);
        setError('Failed to load teams');
        return;
      }

      setTeams((data as TeamWithUsers[]) || []);
    } catch (err) {
      console.error('Error in fetchTeams:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Approve a team
  const approveTeam = async (teamId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', teamId);

      if (error) {
        console.error('Error approving team:', error);
        throw error;
      }

      // Refresh teams list
      await fetchTeams();
      return true;
    } catch (err) {
      console.error('Error in approveTeam:', err);
      throw err;
    }
  };

  // Reject a team
  const rejectTeam = async (teamId: string, reason?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', teamId);

      if (error) {
        console.error('Error rejecting team:', error);
        throw error;
      }

      // Refresh teams list
      await fetchTeams();
      return true;
    } catch (err) {
      console.error('Error in rejectTeam:', err);
      throw err;
    }
  };

  // Delete a team
  const deleteTeam = async (teamId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        console.error('Error deleting team:', error);
        throw error;
      }

      // Refresh teams list
      await fetchTeams();
      return true;
    } catch (err) {
      console.error('Error in deleteTeam:', err);
      throw err;
    }
  };

  // Get statistics
  const getStats = () => {
    const totalTeams = teams.length;
    const pendingTeams = teams.filter(team => team.status === 'pending').length;
    const approvedTeams = teams.filter(team => team.status === 'approved').length;
    const rejectedTeams = teams.filter(team => team.status === 'rejected').length;

    return {
      total: totalTeams,
      pending: pendingTeams,
      approved: approvedTeams,
      rejected: rejectedTeams,
    };
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    approveTeam,
    rejectTeam,
    deleteTeam,
    getStats,
  };
} 