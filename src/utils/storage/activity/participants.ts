
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { v4 as uuidv4 } from 'uuid';
import { Activity } from "@/types/player";

// Handle participant relationships for an activity
export const updateActivityParticipants = async (activity: Activity): Promise<void> => {
  if (!activity.id) {
    console.error("Cannot update participants: Activity ID is missing");
    return;
  }
  
  try {
    console.log(`Updating participants for activity ${activity.id} (${activity.name})`);
    
    // Get current relationships for this activity
    const { data: existingRelationships, error: fetchError } = await supabase
      .from('player_activities')
      .select('*')
      .eq('activity_id', activity.id);
      
    if (fetchError) {
      console.error("Error fetching existing participant relationships:", fetchError);
      throw fetchError;
    }
    
    const existingPlayerIds = existingRelationships?.map(relation => relation.player_id) || [];
    console.log(`Found ${existingPlayerIds.length} existing participants`);
    
    // If no participants in activity, just return
    if (!activity.participants || activity.participants.length === 0) {
      if (existingPlayerIds.length > 0) {
        console.log(`Removing all ${existingPlayerIds.length} participants from activity ${activity.id}`);
        
        // Delete all existing relationships for this activity
        const { error: deleteAllError } = await supabase
          .from('player_activities')
          .delete()
          .eq('activity_id', activity.id);
          
        if (deleteAllError) {
          console.error("Error deleting all participant relationships:", deleteAllError);
          throw deleteAllError;
        }
      }
      return;
    }
    
    // Determine which participants to add and remove
    const playersToAdd = activity.participants.filter(id => !existingPlayerIds.includes(id));
    const playersToRemove = existingPlayerIds.filter(id => !activity.participants.includes(id));
    
    console.log(`Participants to add: ${playersToAdd.length}, to remove: ${playersToRemove.length}`);
    
    // Remove participants that are no longer in the list
    if (playersToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('player_activities')
        .delete()
        .eq('activity_id', activity.id)
        .in('player_id', playersToRemove);
        
      if (deleteError) {
        console.error("Error removing participants:", deleteError);
        throw deleteError;
      }
      
      console.log(`Removed ${playersToRemove.length} participants from activity ${activity.id}`);
    }
    
    // Add new participants
    if (playersToAdd.length > 0) {
      const newRelationships = playersToAdd.map(playerId => ({
        id: uuidv4(),
        activity_id: activity.id,
        player_id: playerId
      }));
      
      const { error: insertError } = await supabase
        .from('player_activities')
        .insert(newRelationships);
        
      if (insertError) {
        console.error("Error adding participants:", insertError);
        throw insertError;
      }
      
      console.log(`Added ${playersToAdd.length} participants to activity ${activity.id}`);
      
      // Log changes for audit trail
      try {
        await logDatabaseChange(
          'update',
          'activity_participants',
          activity.id,
          `Added ${playersToAdd.length} participants to ${activity.name}`
        );
      } catch (logError) {
        console.error("Error logging participant changes (continuing anyway):", logError);
      }
    }
  } catch (error) {
    console.error(`Error updating participants for activity ${activity.id}:`, error);
    throw error;
  }
};
