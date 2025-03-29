
import { supabase } from './client';

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
