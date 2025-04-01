
import { savePlayers } from "../playerStorage";
import { saveActivities } from "../activityStorage";
import { processActivitiesForRestore } from "./utils";

/**
 * Restores data from a backup previously stored in localStorage
 */
export const restoreBackup = async (): Promise<boolean> => {
  try {
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
    
    // Restore activities
    try {
      await saveActivities(processedActivities);
      console.log("Activities restored successfully");
      
      // Reload the page after successful restoration to show the new data
      window.location.reload();
    } catch (error) {
      console.error("Error restoring activities:", error);
      return false;
    }
    
    // Try to log restoration to Supabase, but don't fail if it errors
    try {
      // Import the logDatabaseChange function dynamically to avoid circular dependencies
      const { logDatabaseChange } = await import("@/lib/supabase/logs");
      
      await logDatabaseChange(
        'restore',
        'backup',
        'all',
        `Restored from backup: ${backup.players.length} players and ${backup.activities.length} activities`
      );
    } catch (error) {
      console.error("Error logging restoration (non-critical):", error);
      // This is non-critical, so we still return true
    }
    
    return true;
  } catch (error) {
    console.error("Error in restoreBackup:", error);
    return false;
  }
};
