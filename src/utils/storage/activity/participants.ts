
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Activity } from "@/types/player";
import { fetchPlayerActivities, refreshPlayerActivitiesCache } from "@/lib/supabase/playerActivities";

// Handle participant relationships for an activity with improved error handling and logging
export const updateActivityParticipants = async (activity: Activity): Promise<void> => {
  if (!activity.id) {
    console.error("Cannot update participants: Activity ID is missing");
    throw new Error("Activity ID is missing");
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
    console.log(`Found ${existingPlayerIds.length} existing participants for activity ${activity.name}`);
    
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
        
        // Force refresh cache after deletion
        await refreshPlayerActivitiesCache();
      }
      return;
    }
    
    // Determine which participants to add and remove
    const playersToAdd = activity.participants.filter(id => !existingPlayerIds.includes(id));
    const playersToRemove = existingPlayerIds.filter(id => !activity.participants?.includes(id));
    
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
        id: `${playerId}_${activity.id}`, // Use predictable ID format
        activity_id: activity.id,
        player_id: playerId
      }));
      
      console.log(`Adding ${playersToAdd.length} participants to activity ${activity.id}:`, newRelationships);
      
      const { error: insertError } = await supabase
        .from('player_activities')
        .insert(newRelationships);
        
      if (insertError) {
        console.error("Error adding participants:", insertError);
        
        // Try one by one if bulk insert fails
        let successCount = 0;
        for (const playerId of playersToAdd) {
          try {
            const { error: singleInsertError } = await supabase
              .from('player_activities')
              .insert({
                id: `${playerId}_${activity.id}`,
                activity_id: activity.id,
                player_id: playerId
              });
              
            if (!singleInsertError) {
              successCount++;
            }
          } catch (err) {
            console.error(`Error adding participant ${playerId}:`, err);
          }
        }
        
        if (successCount > 0) {
          console.log(`Added ${successCount}/${playersToAdd.length} participants individually after bulk insert failure`);
          toast.info(`Lade till ${successCount} av ${playersToAdd.length} deltagare`);
        } else {
          toast.error("Kunde inte lägga till deltagare");
          throw new Error("Failed to add participants");
        }
      } else {
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
    }
    
    // Force refresh the player activities cache
    await refreshPlayerActivitiesCache();
  } catch (error) {
    console.error(`Error updating participants for activity ${activity.id}:`, error);
    toast.error("Kunde inte uppdatera deltagare");
    throw error;
  }
};

// Function to verify all player_activities links are valid (IDs match format)
export const validateParticipantLinks = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('player_activities')
      .select('*');
      
    if (error) {
      console.error("Error validating participant links:", error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.warn("No participant links found to validate");
      return true;
    }
    
    let validCount = 0;
    let invalidCount = 0;
    
    for (const link of data) {
      if (link.id === `${link.player_id}_${link.activity_id}`) {
        validCount++;
      } else {
        invalidCount++;
        console.warn("Invalid participant link found:", link);
      }
    }
    
    console.log(`Participant link validation: ${validCount} valid, ${invalidCount} invalid`);
    
    return invalidCount === 0;
  } catch (error) {
    console.error("Error during participant link validation:", error);
    return false;
  }
};
