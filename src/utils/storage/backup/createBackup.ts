
import { supabase } from "@/lib/supabase";
import { BackupData } from "./types";
import { processMatchData } from "./utils";
import { Player, PlayerPosition } from "@/types/player";

/**
 * Creates a backup of all players and activities data and stores it in localStorage
 */
export const createBackup = async (): Promise<void> => {
  try {
    console.log("Starting backup creation process...");
    
    // Fetch players and activities in parallel
    const [playersResponse, activitiesResponse] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('activities').select('*')
    ]);
    
    if (playersResponse.error) {
      console.error("Error fetching players:", playersResponse.error);
      throw playersResponse.error;
    }
    if (activitiesResponse.error) {
      console.error("Error fetching activities:", activitiesResponse.error);
      throw activitiesResponse.error;
    }
    
    const players = playersResponse.data || [];
    const activities = activitiesResponse.data || [];
    
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
    const playersWithActivities: Player[] = players.map(player => {
      // Properly convert position from string to array of PlayerPosition
      let positions: PlayerPosition[] = [];
      
      if (player.position) {
        // Handle position based on its type
        if (typeof player.position === 'string') {
          try {
            // Try to parse as JSON if it contains brackets
            if (player.position.includes('[')) {
              const parsed = JSON.parse(player.position);
              positions = Array.isArray(parsed) ? parsed as PlayerPosition[] : [];
            } else {
              // Treat as space-separated values
              positions = player.position.split(' ').filter(p => p.trim() !== '') as PlayerPosition[];
            }
          } catch (e) {
            // If parsing fails, try to use as a single value
            positions = player.position.trim() ? [player.position as unknown as PlayerPosition] : [];
          }
        } else if (Array.isArray(player.position)) {
          positions = player.position as PlayerPosition[];
        }
      }

      return {
        id: player.id,
        name: player.name,
        grade: player.grade as any,
        positions: positions,
        jersey_number: player.jersey_number || undefined,
        image: player.image || undefined,
        activities: [], // Initialize with empty array
      };
    });
    
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
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
};
