
import { validateBackup } from "../validation";
import { clearExistingData } from "../clearDatabase";
import { restorePlayers } from "../restorePlayers";
import { restoreActivities, restorePlayerActivities } from "../restore-activities";
import { toast } from "sonner";
import { checkDatabaseConnection } from "./databaseConnection";
import { cacheBackupData, refreshCaches } from "./cacheBackupData";
import { logRestoration } from "./logRestoration";
import { validateBackupBeforeRestore } from "./validateBackupData";

/**
 * Main restoration function that orchestrates the entire restore process
 */
export const restoreBackup = async (): Promise<boolean> => {
  try {
    console.log("Starting backup restoration process...");
    
    // Initial validation of backup data
    const rawBackupValidation = validateBackupBeforeRestore();
    if (!rawBackupValidation.isValid || !rawBackupValidation.data) {
      return false;
    }
    
    // Verify database connectivity before proceeding
    const { connected, error: connectionError } = await checkDatabaseConnection();
    if (!connected) {
      console.error("Database connection check failed:", connectionError);
      toast.error("Databasanslutning misslyckades", {
        description: connectionError || "Kontrollera din internetanslutning och försök igen",
        duration: 5000
      });
      return false;
    }
    
    // Further validate backup data structure
    const { backupData, isValid, error } = validateBackup();
    if (!isValid || !backupData) {
      console.error("Backup validation failed:", error);
      toast.error("Säkerhetskopia ogiltig", {
        description: error || "Formatet på säkerhetskopian kunde inte valideras",
        duration: 5000
      });
      return false;
    }
    
    // Count matches in backup before restoration
    const matchCount = backupData.activities.filter(a => a.type === 'match').length;
    console.log(`Restoring backup with ${backupData.activities.length} activities, including ${matchCount} matches`);
    
    // Cache the data for redundancy
    cacheBackupData(backupData);
    
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
      toast.error("Kunde inte återställa spelare: " + (playersError?.message || "Okänt fel"));
      // Continue with activities even if player restore fails
    } else {
      toast.success(`Återställde ${playersCount} spelare`);
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
      toast.error("Kunde inte återställa alla aktiviteter: " + (activitiesError?.message || "Okänt fel"));
      
      // Try again with just match data as a fallback
      const matchActivities = backupData.activities.filter(a => a.type === 'match');
      if (matchActivities && matchActivities.length > 0) {
        console.log(`Trying again with just ${matchActivities.length} match activities`);
        toast.info(`Försöker igen med bara ${matchActivities.length} matcher...`);
        
        const { success: matchSuccess } = await restoreActivities(matchActivities);
        if (!matchSuccess) {
          console.error("Failed to restore even just match activities");
          toast.error("Kunde inte återställa matcher");
        } else {
          toast.success(`Återställde ${matchActivities.length} matcher`);
        }
      }
    } else {
      toast.success(`Återställde ${activitiesCount} aktiviteter`);
    }
    
    // Now restore player-activity relationships
    const { success: relationshipsSuccess, count: relationshipsCount, error: relationshipsError } = 
      await restorePlayerActivities(backupData.players);
    
    if (!relationshipsSuccess) {
      console.warn("There were issues restoring player-activity relationships:", relationshipsError);
      toast.warning("Vissa spelaraktiviteter kunde inte återställas.");
      // Continue despite warnings
    } else {
      toast.success(`Återställde ${relationshipsCount} spelar-aktivitetsrelationer`);
    }
    
    // Log the restoration to the database
    await logRestoration(playersCount, activitiesCount, matchCount);
    
    console.log("Backup restoration completed");
    console.log(`Restored ${playersCount} players, ${activitiesCount} activities, and ${relationshipsCount} relationships`);
    
    // Force a cache update to ensure we get fresh data after restore
    refreshCaches();
    
    // Return success if we have restored some activities or players
    return activitiesCount > 0 || playersCount > 0;
  } catch (error) {
    console.error("Error in restoreBackup:", error);
    toast.error(`Återställningsfel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    return false;
  }
};
