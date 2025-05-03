import { supabase } from "@/lib/supabase/client";
import { updateActivityWithRLSHandling } from "@/lib/supabase/rls-handling";
import { logDatabaseChange } from "@/lib/supabase/logs";
import { Activity } from "@/types/player";
import { toast } from "sonner";

/**
 * Updates match result in the database using different approaches
 * for maximum reliability
 * 
 * @param activity The activity to update
 * @param homeScore Home team score
 * @param awayScore Away team score
 * @param isWin Whether the match was won by Hässleholms IF (undefined = draw)
 * @returns Promise<boolean> indicating whether any update method succeeded
 */
export const updateMatchResultInDatabase = async (
  activity: Activity,
  homeScore?: number,
  awayScore?: number,
  isWin?: boolean
): Promise<boolean> => {
  try {
    // Create appropriate result string
    const resultString = (homeScore !== undefined && awayScore !== undefined) 
      ? `${homeScore}-${awayScore}` 
      : null;

    // Debug the update we're attempting
    console.log("Attempting to update match result:", {
      activityId: activity.id,
      homeScore,
      awayScore,
      isWin,
      resultString
    });
    
    // Prepare update data object - critical fields must be explicitly set to null if undefined
    const updateData = {
      home_score: homeScore !== undefined ? homeScore : null,
      away_score: awayScore !== undefined ? awayScore : null,
      // IMPORTANT: Setting null for draw states in the database
      is_win: isWin === undefined ? null : isWin,
      result: resultString,
      // Ensure we keep these values when updating
      league_id: activity.leagueId || activity.league_id || null, 
      player_stats: activity.player_stats || {}
    };
    
    console.log("Attempting direct Supabase update with data:", updateData);
    
    // Try methods in sequence, stopping when one succeeds
    try {
      // Method 1: Direct update
      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', activity.id)
        .select();
        
      if (!error) {
        console.log("Direct Supabase update succeeded with data:", data);
        await logDatabaseChange(
          'update', 
          'activity', 
          activity.id, 
          `Match result updated directly: ${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'draw' : isWin}`
        );
        
        clearCaches();
        toast.success("Matchresultat sparat i databasen");
        return true;
      }
      
      console.error("Direct Supabase update failed:", error);
    } catch (directError) {
      console.error("Exception in direct update:", directError);
    }
    
    // Method 2: RLS handling approach
    try {
      console.log("Attempting RLS handling update with data:", updateData);
      
      const { success, data } = await updateActivityWithRLSHandling(activity.id, updateData);
      
      if (success) {
        console.log("Activity updated in database successfully via RLS handling:", data);
        clearCaches();
        toast.success("Matchresultat sparat i databasen");
        return true;
      }
    } catch (rlsError) {
      console.error("Failed to update activity with RLS handling:", rlsError);
    }
    
    // Method 3: Minimal update (last resort)
    try {
      // Simplify the update to only the essential fields
      const minimalUpdate = {
        home_score: homeScore !== undefined ? homeScore : null,
        away_score: awayScore !== undefined ? awayScore : null,
        result: resultString,
        is_win: isWin === undefined ? null : isWin
      };
      
      console.log("Attempting minimal update with data:", minimalUpdate);
      
      const { error } = await supabase
        .from('activities')
        .update(minimalUpdate)
        .eq('id', activity.id);
        
      if (!error) {
        console.log("Minimal update succeeded");
        clearCaches();
        toast.success("Matchresultat sparat med förenklad uppdatering");
        return true;
      }
    } catch (minimalError) {
      console.error("Error with minimal update:", minimalError);
    }

    return false;
  } catch (error) {
    console.error("Global error in updateMatchResultInDatabase:", error);
    return false;
  }
};

/**
 * Helper function to clear all caches after a successful update
 */
function clearCaches() {
  // Force refresh local cache to ensure data consistency
  localStorage.removeItem('cachedActivities');
  localStorage.removeItem('sb-activities-fetch-time');
  localStorage.removeItem('sb-activities-last-fetch');
  sessionStorage.removeItem('activities-cache');
  console.log("Cleared local cache after successful update");
}
