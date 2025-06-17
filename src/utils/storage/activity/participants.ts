import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { v4 as uuidv4 } from 'uuid';
import { Activity } from "@/types/player";

// Handle participant relationships for an activity
export const updateActivityParticipants = async (activity: Activity): Promise<void> => {
  if (!activity.id) {
    console.error("Cannot update participants: Activity ID is missing");
    throw new Error("Activity ID is missing");
  }
  
  try {
    console.log(`[updateActivityParticipants] Starting update for activity ${activity.id} (${activity.name})`);
    console.log(`[updateActivityParticipants] Current participants:`, activity.participants);
    
    // Get current relationships for this activity
    const { data: existingRelationships, error: fetchError } = await supabase
      .from('player_activities')
      .select('*')
      .eq('activity_id', activity.id);
      
    if (fetchError) {
      console.error("[updateActivityParticipants] Error fetching existing participant relationships:", fetchError);
      throw fetchError;
    }
    
    const existingPlayerIds = existingRelationships?.map(relation => relation.player_id) || [];
    console.log(`[updateActivityParticipants] Found ${existingPlayerIds.length} existing participants:`, existingPlayerIds);
    
    // If no participants in activity, just return
    if (!activity.participants || activity.participants.length === 0) {
      if (existingPlayerIds.length > 0) {
        console.log(`[updateActivityParticipants] Removing all ${existingPlayerIds.length} participants from activity ${activity.id}`);
        
        // Delete all existing relationships for this activity
        const { error: deleteAllError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id);
          
        if (deleteAllError) {
          console.error("[updateActivityParticipants] Error deleting all participant relationships:", deleteAllError);
          throw deleteAllError;
        }
        
        console.log(`[updateActivityParticipants] Successfully removed all participants`);
      }
      return;
    }
    
    // Determine which participants to add and remove
    const playersToAdd = activity.participants.filter(id => !existingPlayerIds.includes(id));
    const playersToRemove = existingPlayerIds.filter(id => !activity.participants.includes(id));
    
    console.log(`[updateActivityParticipants] Changes needed:
      - To add: ${playersToAdd.length} players (${playersToAdd.join(', ')})
      - To remove: ${playersToRemove.length} players (${playersToRemove.join(', ')})`);
    
    // Remove participants that are no longer in the list
    if (playersToRemove.length > 0) {
      console.log(`[updateActivityParticipants] Removing ${playersToRemove.length} participants...`);
      
      const { error: deleteError } = await supabase
        .from('player_activities')
        .delete()
        .eq('activity_id', activity.id)
        .in('player_id', playersToRemove);
        
      if (deleteError) {
        console.error("[updateActivityParticipants] Error removing participants:", deleteError);
        throw deleteError;
      }
      
      console.log(`[updateActivityParticipants] Successfully removed ${playersToRemove.length} participants`);
    }
    
    // Add new participants
    if (playersToAdd.length > 0) {
      console.log(`[updateActivityParticipants] Adding ${playersToAdd.length} new participants...`);
      
      // Verify that all player IDs are valid strings
      const invalidPlayerIds = playersToAdd.filter(id => typeof id !== 'string' || !id);
      if (invalidPlayerIds.length > 0) {
        console.error("[updateActivityParticipants] Invalid player IDs detected:", invalidPlayerIds);
        throw new Error(`Invalid player IDs: ${invalidPlayerIds.join(', ')}`);
      }
      
      const newRelationships = playersToAdd.map(playerId => ({
        id: uuidv4(),
        activity_id: activity.id,
        player_id: playerId
      }));
      
      console.log(`[updateActivityParticipants] Inserting new relationships:`, newRelationships);
      
      const { error: insertError } = await supabase
        .from('player_activities')
        .insert(newRelationships);
        
      if (insertError) {
        console.error("[updateActivityParticipants] Error adding participants:", insertError);
        throw insertError;
      }
      
      // Verify that the insert was successful by fetching the new relationships
      const { data: verifyData, error: verifyError } = await supabase
        .from('player_activities')
        .select('*')
        .eq('activity_id', activity.id)
        .in('player_id', playersToAdd);
        
      if (verifyError) {
        console.error("[updateActivityParticipants] Error verifying new relationships:", verifyError);
        throw verifyError;
      }
      
      const verifiedCount = verifyData?.length || 0;
      if (verifiedCount !== playersToAdd.length) {
        console.error(`[updateActivityParticipants] Verification failed: Expected ${playersToAdd.length} new relationships, found ${verifiedCount}`);
        throw new Error('Verification of new relationships failed');
      }
      
      console.log(`[updateActivityParticipants] Successfully added and verified ${playersToAdd.length} new participants`);
      
      // Log changes for audit trail
      try {
        await logDatabaseChange(
          'update',
          'activity_participants',
          activity.id,
          `Added ${playersToAdd.length} participants to ${activity.name}`
        );
      } catch (logError) {
        console.error("[updateActivityParticipants] Error logging participant changes (continuing anyway):", logError);
      }
    }
    
    console.log(`[updateActivityParticipants] Update completed successfully for activity ${activity.id}`);
  } catch (error) {
    console.error(`[updateActivityParticipants] Error updating participants for activity ${activity.id}:`, error);
    throw error;
  }
};
