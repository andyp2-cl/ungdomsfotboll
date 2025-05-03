
import { supabase } from "@/lib/supabase/client";
import { updateActivityWithRLSHandling } from "@/lib/supabase/rls-handling";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";

/**
 * Updates match result in the database using different approaches
 * for maximum reliability
 */
export const updateMatchResultInDatabase = async (
  activity: Activity,
  homeScore?: number,
  awayScore?: number,
  isWin?: boolean
): Promise<boolean> => {
  let success = false;
  
  const updateData = {
    home_score: homeScore,
    away_score: awayScore,
    // IMPORTANT: Setting null for draw states in the database
    is_win: isWin === undefined ? null : isWin,
    result: (homeScore !== undefined && awayScore !== undefined) ? `${homeScore}-${awayScore}` : null,
    league_id: activity.league_id, // Preserve league_id when updating
    player_stats: activity.player_stats // Include player_stats
  };
  
  console.log("Attempting direct Supabase update with data:", updateData);
  
  // Try a direct update to the database first
  try {
    const { error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', activity.id);
      
    if (error) {
      console.error("Direct Supabase update failed:", error);
      // Continue to try other methods
    } else {
      console.log("Direct Supabase update succeeded!");
      success = true;
      
      try {
        await logDatabaseChange(
          'update', 
          'activity', 
          activity.id, 
          `Match result updated directly: ${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'draw' : isWin}`
        );
        
        // Force refresh local cache to ensure data consistency
        localStorage.removeItem('cachedActivities');
        localStorage.removeItem('sb-activities-fetch-time');
        localStorage.removeItem('sb-activities-last-fetch');
        sessionStorage.removeItem('activities-cache');
        console.log("Cleared local cache after successful update");
        
        return true;
      } catch (logError) {
        console.warn("Couldn't log direct update to database:", logError);
        // Continue even if logging fails
        return true;
      }
    }
  } catch (directUpdateError) {
    console.error("Error with direct update:", directUpdateError);
  }
  
  // If direct update fails, try with RLS handling approach as backup
  if (!success) {
    try {
      console.log("Attempting RLS handling update with data:", updateData);
      
      const { success: rlsSuccess } = await updateActivityWithRLSHandling(activity.id, updateData);
      
      if (rlsSuccess) {
        console.log("Activity updated in database successfully via RLS handling");
        success = true;
        
        // Force refresh local cache to ensure data consistency
        localStorage.removeItem('cachedActivities');
        localStorage.removeItem('sb-activities-fetch-time');
        localStorage.removeItem('sb-activities-last-fetch');
        sessionStorage.removeItem('activities-cache');
        console.log("Cleared local cache after successful RLS update");
        
        return true;
      }
    } catch (error) {
      console.error("Failed to update activity with RLS handling:", error);
    }
  }

  return success;
};
