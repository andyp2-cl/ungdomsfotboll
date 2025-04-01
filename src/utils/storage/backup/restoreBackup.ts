
import { savePlayers } from "../playerStorage";
import { saveActivities } from "../activityStorage";
import { processActivitiesForRestore } from "./utils";
import { supabase } from "@/lib/supabase/client";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { useToast } from "@/hooks/use-toast";

/**
 * Restores data from a backup previously stored in localStorage
 */
export const restoreBackup = async (): Promise<boolean> => {
  try {
    console.log("Starting backup restoration process...");
    const backupData = localStorage.getItem('hassleholmsif_backup');
    if (!backupData) {
      console.error("No backup found");
      return false;
    }
    
    let backup;
    try {
      backup = JSON.parse(backupData);
    } catch (error) {
      console.error("Error parsing backup data:", error);
      return false;
    }
    
    if (!backup.players || !backup.activities) {
      console.error("Invalid backup format");
      return false;
    }
    
    console.log("Restoring backup with activities:", backup.activities.length);
    
    // Restore players first
    try {
      await savePlayers(backup.players);
      console.log("Players restored successfully");
    } catch (error) {
      console.error("Error restoring players:", error);
      // Continue with activities even if player restore fails
    }
    
    // Process activities to ensure all required fields are properly set
    const processedActivities = processActivitiesForRestore(backup.activities);
    
    console.log("Processed activities for restore:", processedActivities.length);
    console.log("Sample processed activities:", processedActivities.slice(0, 3));
    
    // First validate if activities have the correct format
    const validateActivities = processedActivities.every(activity => {
      const requiredFields = ['id', 'name', 'date', 'type'];
      return requiredFields.every(field => activity[field] !== undefined);
    });
    
    if (!validateActivities) {
      console.error("Some activities are missing required fields");
      return false;
    }
    
    // Restore activities
    try {
      // Split activities into batches to avoid timeouts and memory issues
      const batchSize = 20;
      const batches = [];
      
      for (let i = 0; i < processedActivities.length; i += batchSize) {
        batches.push(processedActivities.slice(i, i + batchSize));
      }
      
      console.log(`Saving activities in ${batches.length} batches`);
      
      for (let i = 0; i < batches.length; i++) {
        console.log(`Processing batch ${i+1}/${batches.length} with ${batches[i].length} activities`);
        await saveActivities(batches[i]);
      }
      
      console.log("All activities restored successfully");
      
      try {
        // Log the restoration to the database
        await logDatabaseChange(
          'restore',
          'backup',
          'all',
          `Restored from backup: ${backup.players.length} players and ${backup.activities.length} activities`
        );
      } catch (error) {
        console.error("Error logging restoration (non-critical):", error);
        // This is non-critical, so we still continue
      }
      
      // Return success
      return true;
    } catch (error) {
      console.error("Error restoring activities:", error);
      return false;
    }
  } catch (error) {
    console.error("Error in restoreBackup:", error);
    return false;
  }
};
