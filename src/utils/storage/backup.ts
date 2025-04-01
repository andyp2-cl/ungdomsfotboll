
import { supabase } from "@/lib/supabase";
import { logDatabaseChange } from "@/lib/supabase/logs";
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
      
      // Ensure all match data is properly stored
      const processedActivities = activities.map(activity => {
        // Create a copy of the activity to avoid mutating the original
        const processedActivity = { ...activity };
        
        // Make sure result property is set if we have scores
        if (activity.type === 'match' && 
            activity.home_score !== null && activity.home_score !== undefined && 
            activity.away_score !== null && activity.away_score !== undefined) {
          processedActivity.result = `${activity.home_score}-${activity.away_score}`;
        }
        
        return processedActivity;
      });
      
      const backupData: BackupData = {
        players: players,
        activities: processedActivities,
        timestamp: new Date().toISOString(),
      };
      
      console.log("Creating backup with activities:", processedActivities.length);
      console.log("Sample match data:", processedActivities.filter(a => a.type === 'match').slice(0, 3));
      
      localStorage.setItem('hassleholmsif_backup', JSON.stringify(backupData));
      
      // Log backup to Supabase
      try {
        await logDatabaseChange(
          'backup',
          'backup',
          'all',
          `Created backup: ${players.length} players and ${processedActivities.length} activities`
        );
      } catch (error) {
        console.error("Error logging backup:", error);
        // Non-critical error, continue with backup creation
      }
      
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
      
      console.log("Restoring backup with activities:", backup.activities.length);
      console.log("Sample match data from backup:", backup.activities.filter(a => a.type === 'match').slice(0, 3));
      
      // Restore players first
      try {
        await savePlayers(backup.players);
        console.log("Players restored successfully");
      } catch (error) {
        console.error("Error restoring players:", error);
        // Continue with activities even if player restore fails
      }
      
      // Process activities to ensure all required fields are properly set
      const processedActivities = backup.activities.map(activity => {
        // Create a shallow copy of the activity
        const processed = { ...activity };
        
        // Convert database field names to application field names if needed
        if (processed.home_score !== undefined && processed.homeScore === undefined) {
          processed.homeScore = processed.home_score;
        }
        
        if (processed.away_score !== undefined && processed.awayScore === undefined) {
          processed.awayScore = processed.away_score;
        }
        
        if (processed.is_win !== undefined && processed.isWin === undefined) {
          processed.isWin = processed.is_win;
        }
        
        // Ensure match data is properly set
        if (processed.type === 'match') {
          // If we have homeScore and awayScore but no result, generate the result
          if (processed.homeScore !== undefined && processed.awayScore !== undefined && !processed.result) {
            processed.result = `${processed.homeScore}-${processed.awayScore}`;
          }
          
          // If we have a result but no scores, try to extract scores from the result
          if (processed.result && (processed.homeScore === undefined || processed.awayScore === undefined)) {
            const scores = processed.result.split('-').map(Number);
            if (scores.length === 2 && !isNaN(scores[0]) && !isNaN(scores[1])) {
              processed.homeScore = scores[0];
              processed.awayScore = scores[1];
            }
          }
          
          // Initialize or update player_stats
          if (!processed.player_stats) {
            processed.player_stats = {
              goals: {},
              assists: {},
              scores: {
                home: processed.homeScore,
                away: processed.awayScore
              },
              isWin: processed.isWin
            };
          } else {
            // Make sure player_stats is an object, not a string
            if (typeof processed.player_stats === 'string') {
              try {
                processed.player_stats = JSON.parse(processed.player_stats);
              } catch (e) {
                console.error("Error parsing player_stats string:", e);
                processed.player_stats = {
                  goals: {},
                  assists: {},
                  scores: {
                    home: processed.homeScore,
                    away: processed.awayScore
                  },
                  isWin: processed.isWin
                };
              }
            }
            
            // Ensure player_stats.scores is set correctly
            processed.player_stats.scores = {
              home: processed.homeScore,
              away: processed.awayScore
            };
            
            // Ensure isWin is set correctly
            processed.player_stats.isWin = processed.isWin;
          }
        }
        
        return processed;
      });
      
      console.log("Processed activities for restore:", processedActivities.length);
      console.log("Sample processed match data:", processedActivities.filter(a => a.type === 'match').slice(0, 3));
      
      // Restore activities
      try {
        await saveActivities(processedActivities);
        console.log("Activities restored successfully");
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
