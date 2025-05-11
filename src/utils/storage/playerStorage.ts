
import { Player } from "@/types/player";
import { mockPlayers } from "@/data/mockData";
import { supabase, logDatabaseChange } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import { formatPlayerForDatabase, formatDatabasePlayer } from "../database/formatters";

// Get players from Supabase or use mockdata as fallback
export const getStoredPlayers = async (): Promise<Player[]> => {
  try {
    // First, get all players
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');

    if (playersError) {
      console.error("Error fetching players:", playersError);
      throw playersError;
    }
    
    console.log("Raw player data from database:", playersData);
    
    const players = playersData.map(formatDatabasePlayer);
    console.log("Transformed players with development data:", players.map(p => ({name: p.name, development: p.development, image: p.image?.substring(0, 30) + "..." })));
    
    // Then, get player-activity relationships and populate the activities array
    const { data: playerActivitiesData, error: relationshipError } = await supabase
      .from('player_activities')
      .select('*');
    
    if (relationshipError) {
      console.error("Error fetching player activities:", relationshipError);
      throw relationshipError;
    }
    
    // Populate activities for each player
    players.forEach(player => {
      const playerActivityRelations = playerActivitiesData.filter(pa => pa.player_id === player.id);
      player.activities = playerActivityRelations.map(relation => relation.activity_id);
    });
    
    if (players.length > 0) {
      console.log("Retrieved players from Supabase:", players.length);
      return players;
    }
    
    // If no players in database, use mockdata and save it
    console.log("No players found in Supabase. Using mock players data as fallback");
    await savePlayers(mockPlayers);
    return mockPlayers;
  } catch (error) {
    console.error("Error fetching players:", error);
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
    
    // Delete relationships that are no longer valid
    const existingActivityIds = existingRelations.map(rel => rel.activity_id);
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
        id: uuidv4(),
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
  } catch (error) {
    console.error("Error updating player activities:", error);
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
      console.log("Development data being saved:", player.development);
      console.log("Image data available:", player.image ? "Yes" : "No");
      
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
        .upsert(formattedPlayer);
        
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
