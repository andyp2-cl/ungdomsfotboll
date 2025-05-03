
import { logDatabaseChange } from "@/lib/supabase/logs";
import { toast } from "sonner";
import { validateBackup } from "./validation";
import { clearExistingData } from "./clearDatabase";
import { restorePlayers } from "./restorePlayers";
import { restoreActivities, restorePlayerActivities } from "./restoreActivities";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Directly fetches the backup data from localStorage
 * This ensures we get exactly what's stored, not the processed version
 */
const getRawBackupData = () => {
  try {
    const backupData = localStorage.getItem('hassleholmsif_backup');
    if (!backupData) return null;
    return JSON.parse(backupData);
  } catch (error) {
    console.error("Failed to parse raw backup data:", error);
    return null;
  }
};

/**
 * Verifies database connectivity before restoration
 */
const checkDatabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    console.log("Performing pre-restore database connection check...");
    
    // First check if Supabase is properly configured
    const isConfigured = await isSupabaseConfigured();
    if (!isConfigured) {
      console.error("Supabase is not properly configured");
      return { connected: false, error: "Databasen är inte korrekt konfigurerad" };
    }
    
    // Try a simple test query to ensure we can write to the database
    console.log("Testing database write permissions...");
    const testId = `test-${Date.now()}`;
    const { error: writeError } = await supabase
      .from('leagues')
      .insert({ id: testId, name: 'Connection Test', division: 'Test', year: 2025 })
      .select()
      .single();
    
    if (writeError) {
      console.log("Database write test failed with error:", writeError);
      
      // Check if it's a row-level security error, which might be expected
      if (writeError.message && writeError.message.includes('row-level security')) {
        console.log("Row-level security prevented test write, but connection seems valid");
        return { connected: true };
      }
      
      // For other errors, try a read-only query as a fallback
      console.log("Attempting read-only test query...");
      const { error: readError } = await supabase
        .from('players')
        .select('id')
        .limit(1);
      
      if (readError) {
        console.error("Database read test also failed:", readError);
        return { 
          connected: false, 
          error: `Databasåtkomst nekad: ${readError.message || "Okänt fel"}` 
        };
      } else {
        console.log("Read test successful, proceeding with limited permissions");
        return { connected: true };
      }
    }
    
    // If we got here, the write test succeeded
    console.log("Database connection and permissions verified");
    return { connected: true };
  } catch (error) {
    console.error("Error checking database connection:", error);
    return { connected: false, error: error instanceof Error ? error.message : 'Okänt fel' };
  }
};

/**
 * Restores data from a backup previously stored in localStorage
 */
export const restoreBackup = async (): Promise<boolean> => {
  try {
    console.log("Starting backup restoration process...");
    
    // Get raw backup data first for diagnostic logging
    const rawBackupData = getRawBackupData();
    if (rawBackupData) {
      console.log("Raw backup data stats:", {
        playerCount: rawBackupData.players?.length || 0,
        activityCount: rawBackupData.activities?.length || 0,
        matchCount: rawBackupData.activities?.filter(a => a.type === 'match').length || 0,
        timestamp: rawBackupData.timestamp
      });
    } else {
      console.error("No raw backup data found");
      toast.error("Ingen säkerhetskopia hittad i lokal lagring");
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
    
    // Validate backup data
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
    
    console.log("Backup restoration completed");
    console.log(`Restored ${playersCount} players, ${activitiesCount} activities, and ${relationshipsCount} relationships`);
    
    // Force a cache update to ensure we get fresh data after restore
    localStorage.setItem('sb-activities-last-update', '0');
    localStorage.setItem('sb-activities-fetch-time', '0');
    localStorage.setItem('sb-connection-test-time', '0');
    
    // Return success if we have restored some activities or players
    return activitiesCount > 0 || playersCount > 0;
  } catch (error) {
    console.error("Error in restoreBackup:", error);
    toast.error(`Återställningsfel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    return false;
  }
};
