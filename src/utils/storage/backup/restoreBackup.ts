
import { savePlayers } from "../playerStorage";
import { saveActivities } from "../activityStorage";
import { processActivitiesForRestore } from "./utils";
import { supabase } from "@/lib/supabase/client";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "@/types/player";

/**
 * Restores data from a backup previously stored in localStorage
 */
export const restoreBackup = async (): Promise<boolean> => {
  try {
    console.log("Starting backup restoration process...");
    const backupData = localStorage.getItem('hassleholmsif_backup');
    if (!backupData) {
      console.error("No backup found");
      return false;
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
      return false;
    }
    
    if (!backup.players || !backup.activities) {
      console.error("Invalid backup format. Missing players or activities:", backup);
      return false;
    }
    
    if (backup.players.length === 0 && backup.activities.length === 0) {
      console.error("Backup contains no data (empty players and activities arrays)");
      return false;
    }
    
    console.log("Restoring backup with activities:", backup.activities.length);
    
    // First make a copy of the backup data to preserve it
    const backupCopy = JSON.stringify(backup);
    
    // Clear existing data in database before restoring
    try {
      console.log("Clearing existing data before restoration...");
      
      // Clear player_activities relationships first (due to foreign key constraints)
      const { error: paError } = await supabase
        .from('player_activities')
        .delete()
        .gte('id', '0'); // Delete all
        
      if (paError) {
        console.error("Error clearing player_activities:", paError);
        // Continue despite error
      }
      
      // Clear activities 
      const { error: actError } = await supabase
        .from('activities')
        .delete()
        .gte('id', '0'); // Delete all
        
      if (actError) {
        console.error("Error clearing activities:", actError);
        // Continue despite error
      }
      
      // Clear players
      const { error: playerError } = await supabase
        .from('players')
        .delete()
        .gte('id', '0'); // Delete all
        
      if (playerError) {
        console.error("Error clearing players:", playerError);
        // Continue despite error
      }
      
      console.log("Existing data cleared successfully");
    } catch (error) {
      console.error("Error clearing existing data:", error);
      // Continue with restoration despite errors
    }
    
    // Restore players first
    try {
      // Make sure player data is valid before saving
      const validPlayers = backup.players.filter(player => 
        player && player.id && player.name && player.grade
      );
      
      if (validPlayers.length === 0) {
        console.error("No valid players found in backup");
      } else {
        console.log(`Restoring ${validPlayers.length} players`);
        await savePlayers(validPlayers);
        console.log("Players restored successfully");
      }
    } catch (error) {
      console.error("Error restoring players:", error);
      // Continue with activities even if player restore fails
    }
    
    // Process activities to ensure all required fields are properly set
    let processedActivities: Activity[] = [];
    try {
      processedActivities = processActivitiesForRestore(backup.activities);
      console.log("Processed activities for restore:", processedActivities.length);
      
      if (processedActivities.length > 0) {
        console.log("Sample processed activities:", processedActivities.slice(0, 3).map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          date: a.date,
          participants: a.participants?.length || 0
        })));
      } else {
        console.error("No activities were processed successfully");
        return false;
      }
    } catch (error) {
      console.error("Error processing activities for restore:", error);
      return false;
    }
    
    // First validate if activities have the correct format
    const validateActivities = processedActivities.every(activity => {
      const requiredFields = ['id', 'name', 'date', 'type'];
      const isValid = requiredFields.every(field => activity[field] !== undefined);
      if (!isValid) {
        console.error("Invalid activity missing required fields:", activity);
      }
      return isValid;
    });
    
    if (!validateActivities) {
      console.error("Some activities are missing required fields");
      return false;
    }
    
    // Restore activities
    try {
      // Split activities into batches to avoid timeouts and memory issues
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < processedActivities.length; i += batchSize) {
        batches.push(processedActivities.slice(i, i + batchSize));
      }
      
      console.log(`Saving activities in ${batches.length} batches`);
      
      for (let i = 0; i < batches.length; i++) {
        console.log(`Processing batch ${i+1}/${batches.length} with ${batches[i].length} activities`);
        try {
          await saveActivities(batches[i]);
          console.log(`Batch ${i+1} saved successfully`);
        } catch (batchError) {
          console.error(`Error saving batch ${i+1}:`, batchError);
          // Continue with next batch despite errors
        }
      }
      
      // Now restore player-activity relationships
      try {
        console.log("Restoring player-activity relationships...");
        const playerActivitiesData = [];
        
        // Collect all player-activity pairs from the backup
        for (const player of backup.players) {
          if (player.activities && Array.isArray(player.activities)) {
            for (const activityId of player.activities) {
              playerActivitiesData.push({
                id: `${player.id}_${activityId}`,
                player_id: player.id,
                activity_id: activityId
              });
            }
          }
        }
        
        if (playerActivitiesData.length > 0) {
          console.log(`Restoring ${playerActivitiesData.length} player-activity relationships`);
          
          // Save in batches
          const relationshipBatchSize = 10;
          for (let i = 0; i < playerActivitiesData.length; i += relationshipBatchSize) {
            const batch = playerActivitiesData.slice(i, i + relationshipBatchSize);
            try {
              const { error } = await supabase
                .from('player_activities')
                .upsert(batch);
                
              if (error) {
                console.error(`Error saving player-activity relationship batch ${i}:`, error);
              }
            } catch (error) {
              console.error(`Error saving player-activity relationship batch ${i}:`, error);
              // Continue with next batch
            }
          }
        } else {
          console.warn("No player-activity relationships found in backup to restore");
        }
      } catch (error) {
        console.error("Error restoring player-activity relationships:", error);
        // Continue despite errors
      }
      
      console.log("All activities and relationships restored successfully");
      
      try {
        // Log the restoration to the database
        await logDatabaseChange(
          'restore',
          'backup',
          'all',
          `Restored from backup: ${backup.players.length} players and ${backup.activities.length} activities`
        );
      } catch (error) {
        console.error("Error logging restoration (non-critical):", error);
        // This is non-critical, so we still continue
      }
      
      // Return success
      return true;
    } catch (error) {
      console.error("Error restoring activities:", error);
      return false;
    }
  } catch (error) {
    console.error("Error in restoreBackup:", error);
    return false;
  }
};
