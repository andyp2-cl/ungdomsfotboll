
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { RestoreResult } from "./types";

/**
 * Restores player-activity relationships from backup data
 */
export const restorePlayerActivities = async (players: any[]): Promise<RestoreResult> => {
  try {
    console.log("Restoring player-activity relationships...");
    const playerActivitiesData = [];
    
    // Collect all player-activity pairs from the backup
    for (const player of players) {
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
    
    if (playerActivitiesData.length === 0) {
      console.warn("No player-activity relationships found in backup to restore");
      return { success: true, count: 0 };
    }
    
    console.log(`Restoring ${playerActivitiesData.length} player-activity relationships`);
    
    // Save in batches
    const relationshipBatchSize = 10;
    let successCount = 0;
    let hasErrors = false;
    
    for (let i = 0; i < playerActivitiesData.length; i += relationshipBatchSize) {
      const batch = playerActivitiesData.slice(i, i + relationshipBatchSize);
      try {
        const { error } = await supabase
          .from('player_activities')
          .upsert(batch, { onConflict: 'id' });
          
        if (error) {
          console.error(`Error saving player-activity relationship batch ${i}:`, error);
          hasErrors = true;
        } else {
          successCount += batch.length;
        }
      } catch (error) {
        console.error(`Error saving player-activity relationship batch ${i}:`, error);
        hasErrors = true;
        // Continue with next batch
      }
    }
    
    return { 
      success: successCount > 0, 
      count: successCount,
      error: hasErrors ? "Some relationships failed" : undefined
    };
  } catch (error) {
    console.error("Error restoring player-activity relationships:", error);
    return { success: false, count: 0, error };
  }
};

/**
 * Verify and cache refreshed activities after restoration
 */
export const verifyAndCacheActivities = async (): Promise<boolean> => {
  try {
    const { data: refreshedActivities } = await supabase
      .from('activities')
      .select('*')
      .eq('type', 'match');
      
    const matchCount = refreshedActivities?.length || 0;
    console.log(`After restoring relationships: ${matchCount} match activities found in database`);
    
    // Cache these activities for redundancy
    if (refreshedActivities && refreshedActivities.length > 0) {
      localStorage.setItem('cachedMatchActivities', JSON.stringify(refreshedActivities));
      localStorage.setItem('cachedMatchActivitiesTime', Date.now().toString());
      toast.info(`Verifierade och cachade ${matchCount} matcher från databasen`);
      return true;
    } else {
      console.warn("No match activities found after restoration!");
      toast.warning("Inga matcher hittades i databasen efter återställning");
      return false;
    }
  } catch (error) {
    console.error("Error fetching refreshed activities (non-critical):", error);
    return false;
  }
};
