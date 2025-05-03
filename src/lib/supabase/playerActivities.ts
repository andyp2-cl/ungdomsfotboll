
import { supabase } from './client';
import { toast } from 'sonner';

// Function to fetch player-activity relationships with improved error handling
export const fetchPlayerActivities = async (): Promise<{playerActivities: Record<string, string[]>, activityPlayers: Record<string, string[]>}> => {
  try {
    console.log('Fetching player-activity relationships from database...');
    
    const { data, error } = await supabase
      .from('player_activities')
      .select('*');
    
    if (error) {
      console.error('Error fetching player activities:', error);
      toast.error('Kunde inte hämta spelaraktivitetsrelationer');
      throw error;
    }
    
    // Map player to activities and activities to players
    const playerActivities: Record<string, string[]> = {};
    const activityPlayers: Record<string, string[]> = {};
    
    if (data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} player-activity relationships`);
      
      data.forEach(relation => {
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
      
      // Cache the relationships for offline use
      try {
        localStorage.setItem('cachedPlayerActivities', JSON.stringify(playerActivities));
        localStorage.setItem('cachedActivityPlayers', JSON.stringify(activityPlayers));
        localStorage.setItem('playerActivitiesFetchTime', Date.now().toString());
      } catch (cacheError) {
        console.error('Error caching player activities:', cacheError);
      }
    } else {
      console.warn('No player-activity relationships found in database');
      
      // Try to load from cache
      const cachedPlayerActivities = localStorage.getItem('cachedPlayerActivities');
      const cachedActivityPlayers = localStorage.getItem('cachedActivityPlayers');
      
      if (cachedPlayerActivities && cachedActivityPlayers) {
        try {
          const parsedPlayerActivities = JSON.parse(cachedPlayerActivities);
          const parsedActivityPlayers = JSON.parse(cachedActivityPlayers);
          console.log('Using cached player-activity relationships');
          return { 
            playerActivities: parsedPlayerActivities, 
            activityPlayers: parsedActivityPlayers 
          };
        } catch (e) {
          console.error('Error parsing cached player activities:', e);
        }
      }
    }
    
    return { playerActivities, activityPlayers };
  } catch (error) {
    console.error('Error in fetchPlayerActivities:', error);
    
    // Try to load from cache as fallback
    try {
      const cachedPlayerActivities = localStorage.getItem('cachedPlayerActivities');
      const cachedActivityPlayers = localStorage.getItem('cachedActivityPlayers');
      
      if (cachedPlayerActivities && cachedActivityPlayers) {
        const parsedPlayerActivities = JSON.parse(cachedPlayerActivities);
        const parsedActivityPlayers = JSON.parse(cachedActivityPlayers);
        console.log('Using cached player-activity relationships after error');
        return { 
          playerActivities: parsedPlayerActivities, 
          activityPlayers: parsedActivityPlayers 
        };
      }
    } catch (cacheError) {
      console.error('Error loading from cache:', cacheError);
    }
    
    return { playerActivities: {}, activityPlayers: {} };
  }
};
