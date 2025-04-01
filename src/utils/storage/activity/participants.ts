
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { v4 as uuidv4 } from 'uuid';
import { Activity } from "./types";

// Handle participant relationships for an activity
export const updateActivityParticipants = async (activity: Activity): Promise<void> => {
  try {
    // Get current relationships for this activity regardless of participant array
    const { data: existingRelations, error: fetchError } = await supabase
      .from('player_activities')
      .select('*')
      .eq('activity_id', activity.id);
        
    if (fetchError) throw fetchError;
    
    // If participants array is empty or undefined, we want to remove all relations
    if (!activity.participants || activity.participants.length === 0) {
      // If there are any existing relations, delete them all
      if (existingRelations && existingRelations.length > 0) {
        console.log(`Clearing all participants (${existingRelations.length}) from activity ${activity.name}`);
        
        // Log the participant removal for each player first
        for (const relation of existingRelations) {
          // Get player name if available
          let playerName = "Player";
          try {
            const { data: playerData } = await supabase
              .from('players')
              .select('name')
              .eq('id', relation.player_id)
              .single();
            
            if (playerData) {
              playerName = playerData.name;
            }
          } catch (e) {
            console.error("Error fetching player name:", e);
          }
          
          await logDatabaseChange(
            'delete',
            'player_activity',
            `${relation.player_id}-${activity.id}`,
            `Removed player "${playerName}" from activity "${activity.name}"`
          );
        }
        
        // Now delete the actual relations
        const { error: deleteError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id);
          
        if (deleteError) throw deleteError;
        
        // Log that all participants were cleared
        await logDatabaseChange(
          'update',
          'activity',
          activity.id,
          `Cleared all participants (${existingRelations.length}) from activity "${activity.name}"`
        );
      }
    } else {
      // Normal handling for activities with participants
      // Delete relationships that are no longer valid
      const existingPlayerIds = existingRelations.map(rel => rel.player_id);
      const playerIdsToRemove = existingPlayerIds.filter(
        playerId => !activity.participants?.includes(playerId)
      );
      
      if (playerIdsToRemove.length > 0) {
        // Log each player removal individually
        for (const playerId of playerIdsToRemove) {
          // Get player name if available
          let playerName = "Player";
          try {
            const { data: playerData } = await supabase
              .from('players')
              .select('name')
              .eq('id', playerId)
              .single();
            
            if (playerData) {
              playerName = playerData.name;
            }
          } catch (e) {
            console.error("Error fetching player name:", e);
          }
          
          await logDatabaseChange(
            'delete',
            'player_activity',
            `${playerId}-${activity.id}`,
            `Removed player "${playerName}" from activity "${activity.name}"`
          );
        }
        
        const { error: deleteError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id)
          .in('player_id', playerIdsToRemove);
          
        if (deleteError) throw deleteError;
      }
      
      // Add new relationships
      const newPlayerIds = activity.participants.filter(
        playerId => !existingPlayerIds.includes(playerId)
      );
      
      if (newPlayerIds.length > 0) {
        const newRelations = newPlayerIds.map(playerId => ({
          id: uuidv4(),
          player_id: playerId,
          activity_id: activity.id
        }));
        
        const { error: insertError } = await supabase
          .from('player_activities')
          .insert(newRelations);
          
        if (insertError) throw insertError;
        
        // Log the added relations
        for (const playerId of newPlayerIds) {
          // Get player name if available
          let playerName = "Player";
          try {
            const { data: playerData } = await supabase
              .from('players')
              .select('name')
              .eq('id', playerId)
              .single();
            
            if (playerData) {
              playerName = playerData.name;
            }
          } catch (e) {
            console.error("Error fetching player name:", e);
          }
          
          await logDatabaseChange(
            'create',
            'player_activity',
            `${playerId}-${activity.id}`,
            `Added player "${playerName}" to activity "${activity.name}"`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating activity participants:", error);
    throw error;
  }
};
