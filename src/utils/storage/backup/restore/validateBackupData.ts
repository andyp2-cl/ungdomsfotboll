
import { toast } from "sonner";

/**
 * Directly fetches the backup data from localStorage
 * This ensures we get exactly what's stored, not the processed version
 */
export const getRawBackupData = () => {
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
 * Validates backup data before restoration
 */
export const validateBackupBeforeRestore = () => {
  try {
    // Get raw backup data first for diagnostic logging
    const rawBackupData = getRawBackupData();
    
    if (rawBackupData) {
      console.log("Raw backup data stats:", {
        playerCount: rawBackupData.players?.length || 0,
        activityCount: rawBackupData.activities?.length || 0,
        matchCount: rawBackupData.activities?.filter(a => a.type === 'match').length || 0,
        timestamp: rawBackupData.timestamp
      });
      return { isValid: true, data: rawBackupData, error: null };
    } else {
      console.error("No raw backup data found");
      toast.error("Ingen säkerhetskopia hittad i lokal lagring");
      return { isValid: false, data: null, error: "No backup data found" };
    }
  } catch (error) {
    console.error("Error in validateBackupBeforeRestore:", error);
    return { isValid: false, data: null, error };
  }
};
