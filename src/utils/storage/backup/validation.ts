
import { Activity } from "@/types/player";
import { validateBackupData } from "./utils";

/**
 * Validates the backup data and ensures it's in the correct format
 */
export const validateBackup = (): { 
  backupData: any;
  isValid: boolean;
  error?: string;
} => {
  try {
    console.log("Validating backup data...");
    const backupData = localStorage.getItem('hassleholmsif_backup');
    
    if (!backupData) {
      console.error("No backup found");
      return { 
        backupData: null, 
        isValid: false, 
        error: "No backup found" 
      };
    }
    
    let backup;
    try {
      backup = JSON.parse(backupData);
      console.log("Loaded backup data:", {
        timestamp: backup.timestamp,
        players: backup.players?.length || 0,
        activities: backup.activities?.length || 0
      });
    } catch (error) {
      console.error("Error parsing backup data:", error);
      return { 
        backupData: null, 
        isValid: false,
        error: "Invalid backup format" 
      };
    }
    
    if (!backup.players || !backup.activities) {
      console.error("Invalid backup format. Missing players or activities:", backup);
      return { 
        backupData: backup, 
        isValid: false,
        error: "Invalid backup format. Missing players or activities" 
      };
    }
    
    if (backup.players.length === 0 && backup.activities.length === 0) {
      console.error("Backup contains no data (empty players and activities arrays)");
      return { 
        backupData: backup, 
        isValid: false,
        error: "Backup contains no data" 
      };
    }
    
    // Use the existing validation function
    const isValid = validateBackupData(backup);
    
    return { 
      backupData: backup, 
      isValid 
    };
  } catch (error) {
    console.error("Error validating backup:", error);
    return { 
      backupData: null, 
      isValid: false,
      error: "Error validating backup" 
    };
  }
};
