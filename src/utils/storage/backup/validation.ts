
import { Player, Activity } from "@/types/player";

/**
 * Validates backup format and integrity
 */
export const validateBackup = () => {
  try {
    // Get backup data from localStorage
    const backupData = localStorage.getItem('hassleholmsif_backup');
    
    if (!backupData) {
      return {
        isValid: false,
        error: "No backup data found",
        backupData: null
      };
    }
    
    // Parse backup data
    const parsed = JSON.parse(backupData);
    
    // Check required data structure
    if (!parsed.players || !Array.isArray(parsed.players)) {
      return {
        isValid: false,
        error: "Invalid backup: players data missing or not an array",
        backupData: null
      };
    }
    
    if (!parsed.activities || !Array.isArray(parsed.activities)) {
      return {
        isValid: false,
        error: "Invalid backup: activities data missing or not an array",
        backupData: null
      };
    }
    
    // Check if we have any data
    if (parsed.players.length === 0 && parsed.activities.length === 0) {
      return {
        isValid: true,
        error: "Warning: Backup contains no players or activities",
        backupData: parsed
      };
    }
    
    // Validate individual player entries
    for (const player of parsed.players) {
      if (!player.id || !player.name) {
        return {
          isValid: false,
          error: `Invalid player data: missing required fields`,
          backupData: null
        };
      }
    }
    
    // Validate individual activity entries
    for (const activity of parsed.activities) {
      if (!activity.id || !activity.name || !activity.date || !activity.type) {
        return {
          isValid: false,
          error: `Invalid activity data: missing required fields`,
          backupData: null
        };
      }
    }
    
    return {
      isValid: true,
      error: null,
      backupData: parsed
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error validating backup: ${error instanceof Error ? error.message : String(error)}`,
      backupData: null
    };
  }
};

/**
 * Validates backup data structure
 */
export const validateBackupData = (data: any): boolean => {
  try {
    // Check basic structure
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.players) || !Array.isArray(data.activities)) return false;
    
    // Check players format if there are any players
    if (data.players.length > 0) {
      const samplePlayer = data.players[0];
      if (!samplePlayer.id || !samplePlayer.name) return false;
    }
    
    // Check activities format if there are any activities
    if (data.activities.length > 0) {
      const sampleActivity = data.activities[0];
      if (!sampleActivity.id || !sampleActivity.name || !sampleActivity.type) return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error validating backup data:", error);
    return false;
  }
};
