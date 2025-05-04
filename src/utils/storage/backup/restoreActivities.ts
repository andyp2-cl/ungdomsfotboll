
import { Activity } from "@/types/player";
import { saveActivities } from "../activityStorage";
import { processActivitiesForRestore } from "./utils";
import { supabase } from "@/lib/supabase/client";

/**
 * Restores activities from backup data
 */
export const restoreActivities = async (activities: any[]): Promise<{
  success: boolean;
  count: number;
  error?: any;
}> => {
  try {
    // Process activities to ensure all required fields are properly set
    let processedActivities: Activity[] = [];
    try {
      processedActivities = processActivitiesForRestore(activities);
      console.log("Processed activities for restore:", processedActivities.length);
      
      if (processedActivities.length === 0) {
        console.error("No activities were processed successfully");
        return { success: false, count: 0, error: "No activities processed" };
      }
    } catch (error) {
      console.error("Error processing activities for restore:", error);
      return { success: false, count: 0, error };
    }
    
    // First validate if activities have the correct format
    const validateActivities = processedActivities.every(activity => {
      const requiredFields = ['id', 'name', 'date', 'type'];
      const isValid = requiredFields.every(field => activity[field] !== undefined);
      if (!isValid) {
        console.error("Invalid activity missing required fields:", activity);
      }
      return isValid;
    });
    
    if (!validateActivities) {
      console.error("Some activities are missing required fields");
      return { success: false, count: 0, error: "Invalid activities" };
    }
    
    // Split activities into batches to avoid timeouts and memory issues
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < processedActivities.length; i += batchSize) {
      batches.push(processedActivities.slice(i, i + batchSize));
    }
    
    console.log(`Saving activities in ${batches.length} batches`);
    
    let successCount = 0;
    let hasErrors = false;
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`Processing batch ${i+1}/${batches.length} with ${batches[i].length} activities`);
      try {
        await saveActivities(batches[i]);
        console.log(`Batch ${i+1} saved successfully`);
        successCount += batches[i].length;
      } catch (batchError) {
        console.error(`Error saving batch ${i+1}:`, batchError);
        hasErrors = true;
        // Continue with next batch despite errors
      }
    }
    
    return { 
      success: successCount > 0, 
      count: successCount,
      error: hasErrors ? "Some batches failed" : undefined
    };
  } catch (error) {
    console.error("Error restoring activities:", error);
    return { success: false, count: 0, error };
  }
};

/**
 * Restores player-activity relationships from backup data
 */
export const restorePlayerActivities = async (players: any[]): Promise<{
  success: boolean;
  count: number;
  error?: any;
}> => {
  try {
    console.log("Restoring player-activity relationships...");
    const playerActivitiesData = [];
    
    // Collect all player-activity pairs from the backup
    for (const player of players) {
      if (player.activities && Array.isArray(player.activities)) {
        for (const activityId of player.activities) {
          playerActivitiesData.push({
            id: `${player.id}_${activityId}`,
            player_id: player.id,
            activity_id: activityId
          });
        }
      }
    }
    
    if (playerActivitiesData.length === 0) {
      console.warn("No player-activity relationships found in backup to restore");
      return { success: true, count: 0 };
    }
    
    console.log(`Restoring ${playerActivitiesData.length} player-activity relationships`);
    
    // Save in batches
    const relationshipBatchSize = 10;
    let successCount = 0;
    let hasErrors = false;
    
    for (let i = 0; i < playerActivitiesData.length; i += relationshipBatchSize) {
      const batch = playerActivitiesData.slice(i, i + relationshipBatchSize);
      try {
        const { error } = await supabase
          .from('player_activities')
          .upsert(batch);
          
        if (error) {
          console.error(`Error saving player-activity relationship batch ${i}:`, error);
          hasErrors = true;
        } else {
          successCount += batch.length;
        }
      } catch (error) {
        console.error(`Error saving player-activity relationship batch ${i}:`, error);
        hasErrors = true;
        // Continue with next batch
      }
    }
    
    return { 
      success: successCount > 0, 
      count: successCount,
      error: hasErrors ? "Some relationships failed" : undefined
    };
  } catch (error) {
    console.error("Error restoring player-activity relationships:", error);
    return { success: false, count: 0, error };
  }
};
