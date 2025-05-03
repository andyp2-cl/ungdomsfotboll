
import { Activity } from "@/types/player";
import { saveActivities } from "../activityStorage";
import { processActivitiesForRestore } from "./utils";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

/**
 * Restores activities from backup data
 */
export const restoreActivities = async (activities: any[]): Promise<{
  success: boolean;
  count: number;
  error?: any;
}> => {
  try {
    // Count match activities in backup for debugging
    const matchCount = activities.filter(a => a.type === 'match').length;
    console.log(`Attempting to restore ${activities.length} activities, including ${matchCount} matches`);
    
    // Process activities to ensure all required fields are properly set
    let processedActivities: Activity[] = [];
    try {
      processedActivities = processActivitiesForRestore(activities);
      console.log("Processed activities for restore:", processedActivities.length);
      
      // Check specifically for matches after processing
      const processedMatchCount = processedActivities.filter(a => a.type === 'match').length;
      console.log(`After processing: ${processedMatchCount} matches ready for restore`);
      
      // Log a sample match to verify data structure
      if (processedMatchCount > 0) {
        const sampleMatch = processedActivities.find(a => a.type === 'match');
        console.log("Sample processed match:", sampleMatch);
      }
      
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
    
    // Special attention to match activities
    const matchActivities = processedActivities.filter(a => a.type === 'match');
    console.log(`Preparing to restore ${matchActivities.length} match activities specifically`);
    
    // Keep a copy of match activities for redundancy
    if (matchActivities.length > 0) {
      // Save to cache immediately for redundancy
      localStorage.setItem('cachedMatchActivities', JSON.stringify(matchActivities));
      toast.info(`Lagrat ${matchActivities.length} matcher i lokal cache för redundans`);
      
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
    
    // Split remaining activities into batches to avoid timeouts and memory issues
    const batchSize = 5;
    const remainingActivities = processedActivities.filter(a => a.type !== 'match');
    const batches = [];
    
    for (let i = 0; i < remainingActivities.length; i += batchSize) {
      batches.push(remainingActivities.slice(i, i + batchSize));
    }
    
    console.log(`Saving remaining activities in ${batches.length} batches`);
    
    let successCount = matchActivities.length; // Start with match count if we saved them
    let hasErrors = false;
    
    // Process remaining activities in batches
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
          .upsert(batch, { onConflict: 'id' });
          
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
    
    // Re-fetch activities to ensure they're properly linked to players
    try {
      const { data: refreshedActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('type', 'match');
        
      const matchCount = refreshedActivities?.length || 0;
      console.log(`After restoring relationships: ${matchCount} match activities found in database`);
      
      // Cache these activities for redundancy
      if (refreshedActivities && refreshedActivities.length > 0) {
        localStorage.setItem('cachedMatchActivities', JSON.stringify(refreshedActivities));
        localStorage.setItem('cachedMatchActivitiesTime', Date.now().toString());
        toast.info(`Verifierade och cachade ${matchCount} matcher från databasen`);
      } else {
        console.warn("No match activities found after restoration!");
        toast.warning("Inga matcher hittades i databasen efter återställning");
      }
    } catch (error) {
      console.error("Error fetching refreshed activities (non-critical):", error);
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
