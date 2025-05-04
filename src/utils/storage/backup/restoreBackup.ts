
import { logDatabaseChange } from "@/lib/supabase/logs";
import { useToast } from "@/hooks/use-toast";
import { validateBackup } from "./validation";
import { clearExistingData } from "./clearDatabase";
import { restorePlayers } from "./restorePlayers";
import { restoreActivities, restorePlayerActivities } from "./restoreActivities";

/**
 * Restores data from a backup previously stored in localStorage
 */
export const restoreBackup = async (): Promise<boolean> => {
  try {
    console.log("Starting backup restoration process...");
    
    // Validate backup data
    const { backupData, isValid, error } = validateBackup();
    if (!isValid || !backupData) {
      console.error("Backup validation failed:", error);
      return false;
    }
    
    console.log("Restoring backup with activities:", backupData.activities.length);
    
    // First make a copy of the backup data to preserve it
    const backupCopy = JSON.stringify(backupData);
    
    // Clear existing data in database before restoring
    const { success: clearSuccess, error: clearError } = await clearExistingData();
    if (!clearSuccess) {
      console.warn("There were issues clearing existing data:", clearError);
      // Continue despite warnings
    }
    
    // Restore players
    const { success: playersSuccess, count: playersCount, error: playersError } = 
      await restorePlayers(backupData.players);
    
    if (!playersSuccess) {
      console.error("Failed to restore players:", playersError);
      // Continue with activities even if player restore fails
    }
    
    // Restore activities
    const { success: activitiesSuccess, count: activitiesCount, error: activitiesError } = 
      await restoreActivities(backupData.activities);
    
    if (!activitiesSuccess) {
      console.error("Failed to restore activities:", activitiesError);
      return false;
    }
    
    // Now restore player-activity relationships
    const { success: relationshipsSuccess, count: relationshipsCount, error: relationshipsError } = 
      await restorePlayerActivities(backupData.players);
    
    if (!relationshipsSuccess) {
      console.warn("There were issues restoring player-activity relationships:", relationshipsError);
      // Continue despite warnings
    }
    
    // Log the restoration to the database
    try {
      await logDatabaseChange(
        'restore',
        'backup',
        'all',
        `Restored from backup: ${playersCount} players and ${activitiesCount} activities`
      );
    } catch (error) {
      console.error("Error logging restoration (non-critical):", error);
      // This is non-critical, so we still continue
    }
    
    console.log("Backup restoration completed successfully");
    console.log(`Restored ${playersCount} players, ${activitiesCount} activities, and ${relationshipsCount} relationships`);
    
    // Return success if we have restored some activities
    return activitiesCount > 0;
  } catch (error) {
    console.error("Error in restoreBackup:", error);
    return false;
  }
};
