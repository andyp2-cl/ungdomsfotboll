
import { supabase } from './client';
import { toast } from 'sonner';

// Enhanced function to fetch player-activity relationships with better error handling and diagnostic logs
export const fetchPlayerActivities = async (): Promise<{playerActivities: Record<string, string[]>, activityPlayers: Record<string, string[]>}> => {
  try {
    console.log('Fetching player-activity relationships from database...');
    
    // Add timestamp to diagnose caching issues
    const timestamp = new Date().toISOString();
    console.log(`Fetch started at: ${timestamp}`);
    
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
      
      // Log a sample of the data for diagnostic purposes
      console.log("Sample of player activities data:", data.slice(0, 3));
      
      data.forEach(relation => {
        if (!relation.player_id || !relation.activity_id) {
          console.warn("Invalid relation found:", relation);
          return; // Skip this relation
        }
        
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
      
      console.log(`Processed relationships: ${Object.keys(playerActivities).length} players and ${Object.keys(activityPlayers).length} activities`);
      
      // Cache the relationships for offline use with timestamp
      try {
        localStorage.setItem('cachedPlayerActivities', JSON.stringify(playerActivities));
        localStorage.setItem('cachedActivityPlayers', JSON.stringify(activityPlayers));
        localStorage.setItem('playerActivitiesFetchTime', Date.now().toString());
        
        console.log('Player activities cache updated successfully');
      } catch (cacheError) {
        console.error('Error caching player activities:', cacheError);
      }
    } else {
      console.warn('No player-activity relationships found in database');
      
      // Try to load from cache
      const cachedPlayerActivities = localStorage.getItem('cachedPlayerActivities');
      const cachedActivityPlayers = localStorage.getItem('cachedActivityPlayers');
      const cacheFetchTime = localStorage.getItem('playerActivitiesFetchTime');
      
      if (cachedPlayerActivities && cachedActivityPlayers) {
        try {
          const parsedPlayerActivities = JSON.parse(cachedPlayerActivities);
          const parsedActivityPlayers = JSON.parse(cachedActivityPlayers);
          console.log(`Using cached player-activity relationships from ${new Date(parseInt(cacheFetchTime || '0'))}`);
          
          return { 
            playerActivities: parsedPlayerActivities, 
            activityPlayers: parsedActivityPlayers 
          };
        } catch (e) {
          console.error('Error parsing cached player activities:', e);
        }
      }
    }
    
    console.log('Final player-activities relationship maps:', {
      playerCount: Object.keys(playerActivities).length,
      activityCount: Object.keys(activityPlayers).length
    });
    
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
    
    // Return empty objects as a last resort
    console.warn('Returning empty player-activity relationships due to errors');
    return { playerActivities: {}, activityPlayers: {} };
  }
};

// Function to refresh the player-activity relationships cache
export const refreshPlayerActivitiesCache = async (): Promise<void> => {
  try {
    console.log('Forcing refresh of player-activity relationships...');
    
    // Clear the cache first to ensure fresh data
    localStorage.removeItem('cachedPlayerActivities');
    localStorage.removeItem('cachedActivityPlayers');
    localStorage.removeItem('playerActivitiesFetchTime');
    
    // Fetch fresh data
    await fetchPlayerActivities();
    
    toast.success('Deltagardata har uppdaterats');
  } catch (error) {
    console.error('Error refreshing player activities cache:', error);
    toast.error('Kunde inte uppdatera deltagardata');
  }
};
