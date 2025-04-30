
import { toast } from "sonner";
import { useBackupRestore } from "../backup";
import { getStoredPlayers } from "../playerStorage";
import { getStoredActivities } from "../activityStorage";

// How often to perform backups (15 minutes)
const BACKUP_INTERVAL = 15 * 60 * 1000;

// Last successful backup timestamp
let lastBackupTime = 0;

/**
 * Automatically performs backups on a regular interval
 */
export const setupAutoBackup = () => {
  // Initialize on first load
  if (!localStorage.getItem('autoBackupEnabled')) {
    localStorage.setItem('autoBackupEnabled', 'true');
    
    // Perform first backup
    performBackup(true);
    
    console.log("Auto-backup system initialized");
  }
  
  // Return cleanup function
  return startBackupInterval();
};

/**
 * Starts the backup interval
 */
export const startBackupInterval = () => {
  const intervalId = setInterval(() => {
    if (localStorage.getItem('autoBackupEnabled') !== 'true') {
      return;
    }
    
    performBackup();
  }, BACKUP_INTERVAL);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

/**
 * Performs the actual backup
 */
export const performBackup = async (silent = false) => {
  try {
    console.log("Auto-backup: Checking if backup is needed...");
    
    // Get current data
    const players = await getStoredPlayers();
    const activities = await getStoredActivities();
    
    // Only backup if we have data to backup
    if (!players.length && !activities.length) {
      console.log("Auto-backup: No data to backup");
      return;
    }
    
    // Use the backup restore utility
    const { createBackup, getLastBackupInfo } = useBackupRestore();
    await createBackup();
    
    // Update last backup time
    lastBackupTime = Date.now();
    localStorage.setItem('lastAutoBackupTime', lastBackupTime.toString());
    
    // Get info about the backup that was just created
    const backupInfo = getLastBackupInfo();
    
    if (!silent && backupInfo) {
      toast.success(
        `Automatisk säkerhetskopiering genomförd (${backupInfo.playerCount} spelare, ${backupInfo.activityCount} aktiviteter)`,
        { duration: 3000 }
      );
    }
    
    console.log(`Auto-backup: Successful backup created with ${backupInfo?.playerCount} players and ${backupInfo?.activityCount} activities`);
    return true;
  } catch (error) {
    console.error("Auto-backup: Failed to create backup:", error);
    
    if (!silent) {
      toast.error("Automatisk säkerhetskopiering misslyckades", { 
        duration: 5000,
        action: {
          label: "Försök igen",
          onClick: () => performBackup()
        }
      });
    }
    return false;
  }
};

/**
 * Check if a backup should be triggered (if data changed)
 */
export const triggerBackupIfNeeded = async (dataChanged = true) => {
  if (!dataChanged) return;
  
  // Check if auto backup is enabled
  if (localStorage.getItem('autoBackupEnabled') !== 'true') {
    return;
  }
  
  // Check if enough time has passed since last backup (at least 5 minutes)
  const now = Date.now();
  const lastBackup = Number(localStorage.getItem('lastAutoBackupTime') || '0');
  const timeSinceLastBackup = now - lastBackup;
  
  // If it's been less than 5 minutes, don't backup again
  if (lastBackup > 0 && timeSinceLastBackup < 5 * 60 * 1000) {
    return;
  }
  
  // Perform the backup
  return performBackup(true);
};
