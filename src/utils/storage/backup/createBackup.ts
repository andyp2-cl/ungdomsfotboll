
import { supabase } from "@/lib/supabase";
import { BackupData } from "./types";
import { processMatchData } from "./utils";
import { Player } from "@/types/player";

/**
 * Creates a backup of all players and activities data and stores it in localStorage
 */
export async function createBackup(): Promise<BackupData> {
  try {
    console.log("Starting backup creation");
    
    // Fetch all players
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      throw new Error(`Error fetching players: ${playersError.message}`);
    }
    
    // Transform players data to match our app format
    const players: (Player & { activities?: string[] })[] = playersData.map((player: any) => {
      // Parse development JSON if it exists
      let development = null;
      if (player.development) {
        try {
          development = typeof player.development === 'string' 
            ? JSON.parse(player.development) 
            : player.development;
        } catch (e) {
          console.error("Error parsing development data during backup:", e);
        }
      }
      
      // Parse positions array if it exists
      let positions: any[] = [];
      if (player.position) {
        try {
          positions = typeof player.position === 'string' 
            ? JSON.parse(player.position) 
            : player.position;
        } catch (e) {
          console.error("Error parsing position data during backup:", e);
        }
      }
      
      return {
        id: player.id,
        name: player.name,
        grade: player.grade,
        positions: positions,
        jerseyNumber: player.jersey_number || '',
        image: player.image,
        development: development,
        activities: []
      };
    });
    
    // Fetch activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('*');
    
    if (activitiesError) {
      throw new Error(`Error fetching activities: ${activitiesError.message}`);
    }
    
    const activities = activitiesData || [];
    
    console.log(`Retrieved ${players.length} players and ${activities.length} activities from database`);
    
    // If we have no data, don't create an empty backup
    if (players.length === 0 && activities.length === 0) {
      console.error("No players or activities found in database, aborting backup");
      throw new Error("No data to backup");
    }
    
    // Fetch player-activity relationships
    const { data: playerActivitiesData, error: paError } = await supabase
      .from('player_activities')
      .select('*');
      
    if (paError) {
      console.error("Error fetching player-activity relationships:", paError);
      // Continue anyway, relationships will be missing
    }
    
    // Create a properly typed copy of players with activities property
    const playersWithActivities: (Player & { activities?: string[] })[] = players.map(player => ({
      ...player,
      activities: [], // Initialize with empty array
    }));
    
    // Attach activities to players
    if (playerActivitiesData && playerActivitiesData.length > 0) {
      playersWithActivities.forEach(player => {
        const playerActivityRelations = playerActivitiesData.filter(pa => pa.player_id === player.id);
        player.activities = playerActivityRelations.map(relation => relation.activity_id);
      });
      
      console.log(`Attached activity relationships to players (${playerActivitiesData.length} relationships)`);
    }
    
    // Ensure all match data is properly stored
    const processedActivities = activities.map(processMatchData);
    
    const backupData: BackupData = {
      players: playersWithActivities,
      activities: processedActivities,
      timestamp: new Date().toISOString(),
    };
    
    console.log("Creating backup with activities:", processedActivities.length);
    
    if (processedActivities.length > 0) {
      console.log("Sample match data:", processedActivities.filter(a => a.type === 'match').slice(0, 3));
    }
    
    // Save to localStorage
    localStorage.setItem('hassleholmsif_backup', JSON.stringify(backupData));
    
    // Log backup to Supabase, but don't fail if it errors
    try {
      // Import the logDatabaseChange function dynamically to avoid circular dependencies
      const { logDatabaseChange } = await import("@/lib/supabase/logs");
      
      await logDatabaseChange(
        'backup',
        'backup',
        'all',
        `Created backup: ${playersWithActivities.length} players and ${processedActivities.length} activities`
      );
    } catch (error) {
      console.error("Error logging backup (non-critical):", error);
      // Non-critical error, continue with backup creation
    }
    
    console.log("Backup created and stored in localStorage");
    return backupData;
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
}
