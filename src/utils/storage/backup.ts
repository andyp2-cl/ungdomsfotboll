
import { Activity, Player } from "@/types/player";
import { getStoredActivities, saveActivities } from "./activityStorage";
import { getStoredPlayers, savePlayers } from "./playerStorage";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

/**
 * Interface for backup data
 */
export interface BackupData {
  players: Player[];
  activities: Activity[];
  timestamp: string;
  version: string;
}

/**
 * Creates a backup of all players and activities
 */
export const createBackup = async (): Promise<BackupData | null> => {
  try {
    // Retrieve current data
    const players = await getStoredPlayers();
    const activities = await getStoredActivities();
    
    // Create backup object with timestamp
    const backup: BackupData = {
      players,
      activities,
      timestamp: new Date().toISOString(),
      version: '1.0' // For future compatibility checks
    };
    
    // Save backup to localStorage
    localStorage.setItem('hassleholmsif_backup', JSON.stringify(backup));
    
    // Also save to Supabase if available
    try {
      const { error } = await supabase
        .from('database_logs')
        .insert({
          action: 'backup',
          entity_type: 'backup',
          entity_id: 'manual-backup-' + new Date().toISOString(),
          details: `Manual backup created with ${players.length} players and ${activities.length} activities`
        });
        
      if (error) console.error("Error logging backup creation:", error);
    } catch (e) {
      console.error("Could not save backup record to Supabase:", e);
    }
    
    return backup;
  } catch (error) {
    console.error("Error creating backup:", error);
    return null;
  }
};

/**
 * Restores data from the last backup
 */
export const restoreFromBackup = async (): Promise<boolean> => {
  try {
    // Get backup from localStorage
    const backupString = localStorage.getItem('hassleholmsif_backup');
    if (!backupString) {
      console.error("No backup found");
      return false;
    }
    
    // Parse backup data
    const backup: BackupData = JSON.parse(backupString);
    
    // Verify backup format
    if (!backup.players || !backup.activities || !backup.timestamp || !backup.version) {
      console.error("Invalid backup format");
      return false;
    }
    
    // Restore players and activities
    await savePlayers(backup.players);
    await saveActivities(backup.activities);
    
    // Log restoration to Supabase
    try {
      const { error } = await supabase
        .from('database_logs')
        .insert({
          action: 'restore',
          entity_type: 'backup',
          entity_id: 'manual-restore-' + new Date().toISOString(),
          details: `Data restored from backup created at ${backup.timestamp} with ${backup.players.length} players and ${backup.activities.length} activities`
        });
        
      if (error) console.error("Error logging backup restoration:", error);
    } catch (e) {
      console.error("Could not save restore record to Supabase:", e);
    }
    
    return true;
  } catch (error) {
    console.error("Error restoring from backup:", error);
    return false;
  }
};

/**
 * Hook for backup and restore functionality
 */
export const useBackupRestore = () => {
  const { toast } = useToast();
  
  const handleCreateBackup = async () => {
    try {
      const backup = await createBackup();
      
      if (backup) {
        const formattedDate = format(new Date(backup.timestamp), 'yyyy-MM-dd HH:mm:ss');
        
        toast({
          title: "Säkerhetskopiering slutförd",
          description: `Backup skapad: ${formattedDate} med ${backup.players.length} spelare och ${backup.activities.length} aktiviteter`,
        });
        return true;
      } else {
        toast({
          title: "Kunde inte skapa säkerhetskopia",
          description: "Ett fel uppstod vid skapandet av säkerhetskopian.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error in handleCreateBackup:", error);
      toast({
        title: "Fel vid säkerhetskopiering",
        description: "Ett oväntat fel uppstod. Försök igen senare.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleRestoreBackup = async () => {
    try {
      const success = await restoreFromBackup();
      
      if (success) {
        toast({
          title: "Återställning slutförd",
          description: "Data har återställts från senaste säkerhetskopian.",
        });
        return true;
      } else {
        toast({
          title: "Kunde inte återställa data",
          description: "Ingen säkerhetskopia hittades eller så var formatet ogiltigt.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error in handleRestoreBackup:", error);
      toast({
        title: "Fel vid återställning",
        description: "Ett oväntat fel uppstod. Försök igen senare.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const getLastBackupInfo = (): { timestamp: string, playerCount: number, activityCount: number } | null => {
    try {
      const backupString = localStorage.getItem('hassleholmsif_backup');
      if (!backupString) return null;
      
      const backup: BackupData = JSON.parse(backupString);
      return {
        timestamp: backup.timestamp,
        playerCount: backup.players.length,
        activityCount: backup.activities.length
      };
    } catch (error) {
      console.error("Error getting backup info:", error);
      return null;
    }
  };
  
  return {
    createBackup: handleCreateBackup,
    restoreBackup: handleRestoreBackup,
    getLastBackupInfo
  };
};
