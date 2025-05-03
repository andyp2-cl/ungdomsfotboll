
import { validateBackupData } from "./utils";

/**
 * Validates a backup file before restoration
 */
export const validateBackup = () => {
  try {
    // Get the backup data from localStorage
    const backupString = localStorage.getItem('hassleholmsif_backup');
    
    if (!backupString) {
      return {
        isValid: false,
        error: "No backup data found in localStorage",
        backupData: null
      };
    }
    
    // Parse the backup data
    const backupData = JSON.parse(backupString);
    
    // Validate the backup data structure
    const isValid = validateBackupData(backupData);
    
    if (isValid) {
      // Check how many activities are in the backup
      const activityCount = backupData.activities.length;
      const playerCount = backupData.players.length;
      const matchCount = backupData.activities.filter((a: any) => a.type === 'match').length;
      
      console.log(`Validation successful. Backup contains ${playerCount} players and ${activityCount} activities, including ${matchCount} matches.`);
      
      // Log first player and activity for debugging
      if (backupData.players.length > 0) {
        console.log("First player sample:", {
          id: backupData.players[0].id,
          name: backupData.players[0].name,
          hasActivities: Array.isArray(backupData.players[0].activities) && backupData.players[0].activities.length > 0
        });
      }
      
      if (backupData.activities.length > 0) {
        const firstMatch = backupData.activities.find((a: any) => a.type === 'match');
        if (firstMatch) {
          console.log("First match sample:", {
            id: firstMatch.id,
            name: firstMatch.name,
            homeScore: firstMatch.homeScore || firstMatch.home_score,
            awayScore: firstMatch.awayScore || firstMatch.away_score
          });
        }
      }
      
      return {
        isValid: true,
        backupData,
        error: null
      };
    } else {
      return {
        isValid: false,
        error: "Backup data validation failed",
        backupData: null
      };
    }
  } catch (error) {
    console.error("Error validating backup:", error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error during validation",
      backupData: null
    };
  }
};
