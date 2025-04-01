import { supabase, logDatabaseChange } from "@/lib/supabase";
import { savePlayers } from "./playerStorage";
import { saveActivities } from "./activityStorage";

interface BackupData {
  players: any[];
  activities: any[];
  timestamp: string;
}

export const useBackupRestore = () => {
  const createBackup = async (): Promise<void> => {
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
      
      const backupData: BackupData = {
        players: players,
        activities: activities,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('hassleholmsif_backup', JSON.stringify(backupData));
      
      // Log backup to Supabase
      await logDatabaseChange(
        'backup',
        'backup',
        'all',
        `Created backup: ${players.length} players and ${activities.length} activities`
      );
      
      console.log("Backup created and stored in localStorage");
    } catch (error) {
      console.error("Error creating backup:", error);
      throw error;
    }
  };
  
  const getLastBackupInfo = (): {timestamp: string, playerCount: number, activityCount: number} | null => {
    const backupData = localStorage.getItem('hassleholmsif_backup');
    if (!backupData) {
      return null;
    }
    
    try {
      const backup: BackupData = JSON.parse(backupData);
      return {
        timestamp: backup.timestamp,
        playerCount: backup.players.length,
        activityCount: backup.activities.length
      };
    } catch (error) {
      console.error("Error parsing backup data:", error);
      return null;
    }
  };
  
  // In the restoreBackup function, modify the restoration logic to ensure match results are preserved
  const restoreBackup = async (): Promise<boolean> => {
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
      
      // Restore players
      try {
        await savePlayers(backup.players);
      } catch (error) {
        console.error("Error restoring players:", error);
        // Continue with activities even if player restore fails
      }
      
      // Restore activities
      try {
        // Make sure result, homeScore, and awayScore are properly preserved
        const cleanedActivities = backup.activities.map(activity => {
          // Create a shallow copy of the activity
          const cleanActivity = { ...activity };
          
          // Ensure homeScore, awayScore, and result are properly set
          if (cleanActivity.type === 'match') {
            // If we have homeScore and awayScore but no result, generate the result
            if (cleanActivity.homeScore !== undefined && cleanActivity.awayScore !== undefined && !cleanActivity.result) {
              cleanActivity.result = `${cleanActivity.homeScore}-${cleanActivity.awayScore}`;
            }
            
            // If we have a result but no scores, try to extract scores from the result
            if (cleanActivity.result && (cleanActivity.homeScore === undefined || cleanActivity.awayScore === undefined)) {
              const scores = cleanActivity.result.split('-').map(Number);
              if (scores.length === 2 && !isNaN(scores[0]) && !isNaN(scores[1])) {
                cleanActivity.homeScore = scores[0];
                cleanActivity.awayScore = scores[1];
              }
            }
            
            // Initialize player_stats if it doesn't exist
            if (!cleanActivity.player_stats) {
              cleanActivity.player_stats = {
                goals: {},
                assists: {},
                scores: {
                  home: cleanActivity.homeScore,
                  away: cleanActivity.awayScore
                },
                isWin: cleanActivity.isWin
              };
            } else {
              // Ensure player_stats.scores is set correctly
              cleanActivity.player_stats.scores = {
                home: cleanActivity.homeScore,
                away: cleanActivity.awayScore
              };
            }
          }
          
          return cleanActivity;
        });
        
        await saveActivities(cleanedActivities);
      } catch (error) {
        console.error("Error restoring activities:", error);
        return false;
      }
      
      // Log restoration to Supabase
      try {
        await logDatabaseChange(
          'restore',
          'backup',
          'all',
          `Restored from backup: ${backup.players.length} players and ${backup.activities.length} activities`
        );
      } catch (error) {
        console.error("Error logging restoration:", error);
        // This is non-critical, so we still return true
      }
      
      return true;
    } catch (error) {
      console.error("Error in restoreBackup:", error);
      return false;
    }
  };

  return { createBackup, restoreBackup, getLastBackupInfo };
};
