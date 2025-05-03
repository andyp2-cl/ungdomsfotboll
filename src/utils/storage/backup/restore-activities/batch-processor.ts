
import { Activity } from "@/types/player";
import { saveActivities } from "../../activityStorage";
import { RestoreResult } from "./types";

/**
 * Process activities in batches to avoid timeouts and memory issues
 */
export const processActivityBatches = async (
  activities: Activity[],
  initialCount: number = 0,
  batchSize: number = 5
): Promise<RestoreResult> => {
  if (!activities || activities.length === 0) {
    return { success: true, count: initialCount };
  }

  // Split activities into batches
  const batches = [];
  for (let i = 0; i < activities.length; i += batchSize) {
    batches.push(activities.slice(i, i + batchSize));
  }
  
  console.log(`Saving activities in ${batches.length} batches`);
  
  let successCount = initialCount; // Start with initial count (e.g., from match activities)
  let hasErrors = false;
  
  // Process activities in batches
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
};
