
import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';
import { Player, Activity } from '@/types/player';

// Export supabase client directly
export const supabase = supabaseClient;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // Since we now have a correctly configured client
};

// Function to fetch players from Supabase
export const fetchPlayers = async (): Promise<Player[]> => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*');
    
    if (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
    
    // Transform the database format to our application format
    return (data || []).map(player => ({
      id: player.id,
      name: player.name,
      grade: player.grade as any,
      positions: player.position ? [player.position as any] : undefined,
      jerseyNumber: player.jersey_number || undefined,
      image: player.image || undefined,
      activities: [] // We'll fetch activities separately
    }));
  } catch (error) {
    console.error('Error in fetchPlayers:', error);
    return [];
  }
};

// Function to fetch activities from Supabase
export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*');
    
    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
    
    // Transform the database format to our application format
    return (data || []).map(activity => ({
      id: activity.id,
      name: activity.name,
      date: activity.date,
      type: activity.type as any,
      time: activity.time || undefined,
      location: activity.location_name ? {
        name: activity.location_name,
        description: activity.location_description || undefined,
        gpsLink: activity.location_gps_link || undefined
      } : undefined,
      kioskAssignedPlayerId: activity.kiosk_assigned_player_id || undefined,
      scraped: activity.scraped || false,
      participants: [] // We'll fetch participants separately
    }));
  } catch (error) {
    console.error('Error in fetchActivities:', error);
    return [];
  }
};

// Function to fetch player-activity relationships
export const fetchPlayerActivities = async (): Promise<{playerActivities: Record<string, string[]>, activityPlayers: Record<string, string[]>}> => {
  try {
    const { data, error } = await supabase
      .from('player_activities')
      .select('*');
    
    if (error) {
      console.error('Error fetching player activities:', error);
      throw error;
    }
    
    // Map player to activities and activities to players
    const playerActivities: Record<string, string[]> = {};
    const activityPlayers: Record<string, string[]> = {};
    
    (data || []).forEach(relation => {
      // Add activity to player's activities
      if (!playerActivities[relation.player_id]) {
        playerActivities[relation.player_id] = [];
      }
      playerActivities[relation.player_id].push(relation.activity_id);
      
      // Add player to activity's participants
      if (!activityPlayers[relation.activity_id]) {
        activityPlayers[relation.activity_id] = [];
      }
      activityPlayers[relation.activity_id].push(relation.player_id);
    });
    
    return { playerActivities, activityPlayers };
  } catch (error) {
    console.error('Error in fetchPlayerActivities:', error);
    return { playerActivities: {}, activityPlayers: {} };
  }
};

// New function to log database changes
export const logDatabaseChange = async (
  action: 'create' | 'update' | 'delete', 
  entityType: 'player' | 'activity' | 'player_activity',
  entityId: string,
  details: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('database_logs')
      .insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging database change:', error);
    }
  } catch (error) {
    console.error('Error in logDatabaseChange:', error);
  }
};

// Function to fetch database logs
export const fetchDatabaseLogs = async (limit: number = 50): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('database_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching database logs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchDatabaseLogs:', error);
    return [];
  }
};
