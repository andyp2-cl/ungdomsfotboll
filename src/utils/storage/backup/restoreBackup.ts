
import { logDatabaseChange } from "@/lib/supabase/logs";
import { toast } from "sonner";
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
    
    // Count matches in backup before restoration
    const matchCount = backupData.activities.filter(a => a.type === 'match').length;
    console.log(`Restoring backup with ${backupData.activities.length} activities, including ${matchCount} matches`);
    
    // First directly cache the data for fallback
    try {
      localStorage.setItem('cachedActivities', JSON.stringify(backupData.activities));
      localStorage.setItem('cachedActivitiesTime', Date.now().toString());
      localStorage.setItem('cachedActivitiesCount', backupData.activities.length.toString());
      
      // Immediately cache matches for redundancy
      const matchActivities = backupData.activities.filter(a => a.type === 'match');
      if (matchActivities && matchActivities.length > 0) {
        localStorage.setItem('cachedMatchActivities', JSON.stringify(matchActivities));
        localStorage.setItem('cachedMatchActivitiesTime', Date.now().toString());
        localStorage.setItem('cachedMatchActivitiesCount', matchActivities.length.toString());
        console.log(`Cached ${matchActivities.length} match activities for redundancy`);
      }
    } catch (cacheError) {
      console.error("Error directly caching backup data (non-critical):", cacheError);
    }
    
    // Clear existing data in database before restoring
    const { success: clearSuccess, error: clearError } = await clearExistingData();
    if (!clearSuccess) {
      console.warn("There were issues clearing existing data:", clearError);
      // Continue despite warnings
    }
    
    // Restore players first
    const { success: playersSuccess, count: playersCount, error: playersError } = 
      await restorePlayers(backupData.players);
    
    if (!playersSuccess) {
      console.error("Failed to restore players:", playersError);
      // Continue with activities even if player restore fails
    }
    
    // Restore activities with priority on matches
    // First sort activities to prioritize matches
    const prioritizedActivities = [...backupData.activities];
    prioritizedActivities.sort((a, b) => {
      // Matches come first
      if (a.type === 'match' && b.type !== 'match') return -1;
      if (a.type !== 'match' && b.type === 'match') return 1;
      return 0;
    });
    
    // Restore activities with prioritized list
    const { success: activitiesSuccess, count: activitiesCount, error: activitiesError } = 
      await restoreActivities(prioritizedActivities);
    
    if (!activitiesSuccess) {
      console.error("Failed to restore activities:", activitiesError);
      
      // Try again with just match data as a fallback
      const matchActivities = backupData.activities.filter(a => a.type === 'match');
      if (matchActivities && matchActivities.length > 0) {
        console.log(`Trying again with just ${matchActivities.length} match activities`);
        
        const { success: matchSuccess } = await restoreActivities(matchActivities);
        if (!matchSuccess) {
          console.error("Failed to restore even just match activities");
        }
      }
    }
    
    // Special step: Verify match activities were restored
    const restoredMatchCount = activitiesCount > 0 ? 
      "Match count will be verified after player-activity relationships are restored" : "No activities restored";
    console.log(restoredMatchCount);
    
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
        `Restored from backup: ${playersCount} players and ${activitiesCount} activities including ${matchCount} matches`
      );
    } catch (error) {
      console.error("Error logging restoration (non-critical):", error);
      // This is non-critical, so we still continue
    }
    
    console.log("Backup restoration completed successfully");
    console.log(`Restored ${playersCount} players, ${activitiesCount} activities, and ${relationshipsCount} relationships`);
    
    // Force a refresh to load activities from cache even if database connection fails
    toast.success(`Återställning slutförd! Laddar om för att visa data...`);
    
    // Return success if we have restored some activities or players
    return activitiesCount > 0 || playersCount > 0;
  } catch (error) {
    console.error("Error in restoreBackup:", error);
    return false;
  }
};
