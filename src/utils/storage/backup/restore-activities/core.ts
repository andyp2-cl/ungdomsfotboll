import { Activity } from "@/types/player";
import { saveActivities } from "../../activityStorage";
import { processActivitiesBeforeRestore, cacheMatchActivities } from "./process-activities";
import { processActivityBatches } from "./batch-processor";
import { RestoreResult } from "./types";
import { restorePlayerActivities as restorePlayerActivitiesImpl, verifyAndCacheActivities } from "./player-activities";

/**
 * Restores activities from backup data
 */
export const restoreActivities = async (activities: any[]): Promise<RestoreResult> => {
  try {
    // Process and validate activities
    const { processedActivities, matchActivities, hasValidActivities } = 
      processActivitiesBeforeRestore(activities);
    
    if (!hasValidActivities) {
      return { success: false, count: 0, error: "Invalid activities" };
    }
    
    // Keep a copy of match activities for redundancy
    if (matchActivities.length > 0) {
      cacheMatchActivities(matchActivities);
      
      // Save matches first in a separate batch to prioritize them
      try {
        console.log("Saving match activities as priority batch");
        await saveActivities(matchActivities);
        console.log("Match activities saved successfully");
      } catch (matchError) {
        console.error("Error saving match activities:", matchError);
        // Continue with other activities
      }
    }
    
    // Process remaining activities in batches
    const remainingActivities = processedActivities.filter(a => a.type !== 'match');
    const result = await processActivityBatches(remainingActivities, matchActivities.length);
    
    return result;
  } catch (error) {
    console.error("Error restoring activities:", error);
    return { success: false, count: 0, error };
  }
};

// Re-export the restorePlayerActivities function
export { restorePlayerActivitiesImpl as restorePlayerActivities };

// Export verification function
export { verifyAndCacheActivities };
