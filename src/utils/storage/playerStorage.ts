
import { Player } from "@/types/player";
import { mockPlayers } from "@/data/mockData";
import { supabase, logDatabaseChange } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { formatPlayerForDatabase, formatDatabasePlayer } from "../database/formatters";
import { toast } from "sonner";
import { fetchPlayerActivities } from "@/lib/supabase/playerActivities";

// Get players from Supabase or use mockdata as fallback
export const getStoredPlayers = async (): Promise<Player[]> => {
  try {
    console.log("Fetching players from database...");
    
    // First, get all players
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');

    if (playersError) {
      console.error("Error fetching players:", playersError);
      throw playersError;
    }
    
    const players = playersData.map(formatDatabasePlayer);
    console.log(`Fetched ${players.length} players from database`);
    
    // Then, get player-activity relationships and populate the activities array
    try {
      const { playerActivities } = await fetchPlayerActivities();
      
      // Populate activities for each player
      if (playerActivities) {
        players.forEach(player => {
          player.activities = playerActivities[player.id] || [];
        });
        console.log("Successfully populated player activities");
      } else {
        console.warn("No player-activity relationships returned");
      }
    } catch (relationshipError) {
      console.error("Error fetching player-activity relationships:", relationshipError);
      toast.error("Kunde inte hämta spelaraktivitetsrelationer");
      
      // Try to get from cache
      const cachedPlayerActivities = localStorage.getItem('cachedPlayerActivities');
      if (cachedPlayerActivities) {
        try {
          const playerActivitiesMap = JSON.parse(cachedPlayerActivities);
          players.forEach(player => {
            player.activities = playerActivitiesMap[player.id] || [];
          });
          console.log("Used cached player-activity relationships as fallback");
        } catch (cacheError) {
          console.error("Error parsing cached player activities:", cacheError);
        }
      }
    }
    
    if (players.length > 0) {
      console.log("Retrieved players from Supabase:", players.length);
      
      // Cache players for offline use
      try {
        localStorage.setItem('cachedPlayers', JSON.stringify(players));
        localStorage.setItem('playersFetchTime', Date.now().toString());
      } catch (cacheError) {
        console.error("Error caching players:", cacheError);
      }
      
      return players;
    }
    
    // If no players in database, use mockdata and save it
    console.log("No players found in Supabase. Using mock players data as fallback");
    await savePlayers(mockPlayers);
    return mockPlayers;
  } catch (error) {
    console.error("Error fetching players:", error);
    
    // Try to load from cache as fallback
    try {
      const cachedPlayers = localStorage.getItem('cachedPlayers');
      if (cachedPlayers) {
        const parsedPlayers = JSON.parse(cachedPlayers);
        console.log(`Loaded ${parsedPlayers.length} players from cache`);
        return parsedPlayers;
      }
    } catch (cacheError) {
      console.error("Error loading from cache:", cacheError);
    }
    
    return mockPlayers;
  }
};

// Handle player-activity relationships
export const updatePlayerActivities = async (player: Player): Promise<void> => {
  if (!player.activities || player.activities.length === 0) return;
  
  try {
    // Get current relationships for this player
    const { data: existingRelations, error: fetchError } = await supabase
      .from('player_activities')
      .select('*')
      .eq('player_id', player.id);
      
    if (fetchError) {
      console.error(`Error fetching relations for player ${player.name}:`, fetchError);
      throw fetchError;
    }
    
    const existingActivityIds = existingRelations?.map(rel => rel.activity_id) || [];
    console.log(`Player ${player.name} has ${existingActivityIds.length} existing activities`);
    
    // Delete relationships that are no longer valid
    const activityIdsToRemove = existingActivityIds.filter(
      actId => !player.activities?.includes(actId)
    );
    
    if (activityIdsToRemove.length > 0) {
      console.log(`Removing ${activityIdsToRemove.length} activities for player ${player.name}`);
      
      const { error: deleteError } = await supabase
        .from('player_activities')
        .delete()
        .eq('player_id', player.id)
        .in('activity_id', activityIdsToRemove);
        
      if (deleteError) {
        console.error(`Error deleting relations for player ${player.name}:`, deleteError);
        throw deleteError;
      }
      
      // Log the removed relations
      for (const activityId of activityIdsToRemove) {
        await logDatabaseChange(
          'delete',
          'player_activity',
          `${player.id}-${activityId}`,
          `Removed player ${player.name} from activity with ID ${activityId}`
        );
      }
    }
    
    // Add new relationships
    const newActivityIds = player.activities.filter(
      actId => !existingActivityIds.includes(actId)
    );
    
    if (newActivityIds.length > 0) {
      console.log(`Adding ${newActivityIds.length} activities for player ${player.name}`);
      
      const newRelations = newActivityIds.map(activityId => ({
        id: `${player.id}_${activityId}`, // Use predictable ID format
        player_id: player.id,
        activity_id: activityId
      }));
      
      const { error: insertError } = await supabase
        .from('player_activities')
        .insert(newRelations);
        
      if (insertError) {
        console.error(`Error inserting relations for player ${player.name}:`, insertError);
        throw insertError;
      }
      
      // Log the added relations
      for (const activityId of newActivityIds) {
        await logDatabaseChange(
          'create',
          'player_activity',
          `${player.id}-${activityId}`,
          `Added player ${player.name} to activity with ID ${activityId}`
        );
      }
    }
    
    // Update cache after successful update
    try {
      const { playerActivities, activityPlayers } = await fetchPlayerActivities();
      localStorage.setItem('cachedPlayerActivities', JSON.stringify(playerActivities));
      localStorage.setItem('cachedActivityPlayers', JSON.stringify(activityPlayers));
      localStorage.setItem('playerActivitiesFetchTime', Date.now().toString());
    } catch (cacheError) {
      console.error('Error updating player activities cache:', cacheError);
    }
  } catch (error) {
    console.error("Error updating player activities:", error);
    toast.error(`Kunde inte uppdatera aktiviteter för ${player.name}`);
    throw error;
  }
};

// Save players to Supabase
export const savePlayers = async (players: Player[]): Promise<void> => {
  console.log("Saving players to Supabase:", players.length);
  
  try {
    // Improved error handling and logging for better debugging
    for (const player of players) {
      const formattedPlayer = formatPlayerForDatabase(player);
      
      console.log(`Upserting player: ${player.name} (ID: ${player.id})`);
      
      // Check if player already exists to determine if this is an update or create
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('id', player.id)
        .single();
      
      const isNewPlayer = !existingPlayer;
      
      // Upsert the player
      const { error: upsertError } = await supabase
        .from('players')
        .upsert(formattedPlayer, { onConflict: 'id' });
        
      if (upsertError) {
        console.error(`Error upserting player ${player.name}:`, upsertError);
        throw upsertError;
      } else {
        console.log(`Successfully upserted player: ${player.name}`);
        
        // Log the change
        await logDatabaseChange(
          isNewPlayer ? 'create' : 'update',
          'player',
          player.id,
          `${isNewPlayer ? 'Created' : 'Updated'} player: ${player.name}`
        );
      }
      
      // Handle player-activity relationships
      if (player.activities && player.activities.length > 0) {
        await updatePlayerActivities(player);
      }
    }
    
    console.log("Players saved successfully to Supabase");
  } catch (error) {
    console.error("Error saving players to Supabase:", error);
    // Re-throw to allow caller to handle
    throw error;
  }
};
