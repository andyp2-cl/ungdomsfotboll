
import { supabase } from "@/lib/supabase";
import { BackupData } from "./types";
import { processMatchData } from "./utils";

/**
 * Creates a backup of all players and activities data and stores it in localStorage
 */
export const createBackup = async (): Promise<void> => {
  try {
    // Fetch players and activities in parallel
    const [playersResponse, activitiesResponse] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('activities').select('*')
    ]);
    
    if (playersResponse.error) throw playersResponse.error;
    if (activitiesResponse.error) throw activitiesResponse.error;
    
    const players = playersResponse.data || [];
    const activities = activitiesResponse.data || [];
    
    // Ensure all match data is properly stored
    const processedActivities = activities.map(processMatchData);
    
    const backupData: BackupData = {
      players: players,
      activities: processedActivities,
      timestamp: new Date().toISOString(),
    };
    
    console.log("Creating backup with activities:", processedActivities.length);
    console.log("Sample match data:", processedActivities.filter(a => a.type === 'match').slice(0, 3));
    
    localStorage.setItem('hassleholmsif_backup', JSON.stringify(backupData));
    
    // Log backup to Supabase, but don't fail if it errors
    try {
      // Import the logDatabaseChange function dynamically to avoid circular dependencies
      const { logDatabaseChange } = await import("@/lib/supabase/logs");
      
      await logDatabaseChange(
        'backup',
        'backup',
        'all',
        `Created backup: ${players.length} players and ${processedActivities.length} activities`
      );
    } catch (error) {
      console.error("Error logging backup (non-critical):", error);
      // Non-critical error, continue with backup creation
    }
    
    console.log("Backup created and stored in localStorage");
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
};
