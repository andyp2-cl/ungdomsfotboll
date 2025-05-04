import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase/rls-handling";
import { isHomeMatch, extractTeamNames, isHassleholm } from "@/components/activity-detail/match-result/utils/team-detection";
import { toast as toastLibrary } from "sonner";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity"; 
import { logDatabaseChange } from "@/lib/supabase/logs";
import { supabase } from "@/lib/supabase/client";

/**
 * Updates match result (score) for an existing activity
 * Uses multiple approaches for maximum reliability
 */
export const handleMatchResultUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string,
  homeScore?: number,
  awayScore?: number
): Promise<boolean> => {
  try {
    console.log(`Updating match result for activity ${activityId}: ${homeScore}-${awayScore}`);
    
    // Find the existing activity
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      console.error(`Activity with id ${activityId} not found`);
      toastLibrary.error("Kunde inte hitta aktiviteten");
      return false;
    }
    
    // Enhanced logic to determine if Hässleholms IF won the match
    let isWin: boolean | undefined;
    
    // Only calculate outcome if we have scores
    if (homeScore !== undefined && awayScore !== undefined) {
      // Draw case: scores are equal
      if (homeScore === awayScore) {
        isWin = undefined; // Draw is represented as undefined
        console.log(`Match is a draw: ${homeScore}-${awayScore}`);
      } else {
        // Extract team names to check which team is Hässleholms IF
        const { homeTeam, awayTeam } = extractTeamNames(activity);
        const isHifHome = isHassleholm(homeTeam);
        const isHifAway = isHassleholm(awayTeam);
        
        console.log(`Team detection:`, {
          homeTeam,
          awayTeam,
          isHifHome,
          isHifAway
        });
        
        // If we can identify that Hässleholms IF is home or away, use that to determine win
        if (isHifHome) {
          isWin = homeScore > awayScore;
          console.log(`HIF is home team, ${isWin ? "win" : "loss"} with score ${homeScore}-${awayScore}`);
        } else if (isHifAway) {
          isWin = awayScore > homeScore;
          console.log(`HIF is away team, ${isWin ? "win" : "loss"} with score ${homeScore}-${awayScore}`);
        } else {
          // If we can't identify by name, fall back to using isHomeMatch
          const isHome = isHomeMatch(activity);
          isWin = isHome ? (homeScore > awayScore) : (awayScore > homeScore);
          console.log(`Could not detect HIF in team names, using fallback: isHome=${isHome}, isWin=${isWin}`);
        }
      }
      
      console.log(`Determined match outcome for ${activity.name}: ${isWin === undefined ? 'draw' : isWin ? 'win' : 'loss'}`);
    }
    
    // Create result string ONLY if both scores exist
    const result = (homeScore !== undefined && awayScore !== undefined)
      ? `${homeScore}-${awayScore}`
      : undefined;
    
    console.log(`Final activity data: scores=${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'undefined (draw)' : isWin ? 'win' : 'loss'}, result=${result}`);
    
    // Create updated activity with new scores, preserving existing player_stats
    const updatedActivity: Activity = {
      ...activity,
      homeScore,
      awayScore,
      isWin, // This will be true/false/undefined (undefined for draw)
      result,
      // Ensure we preserve the player_stats when updating scores
      player_stats: activity.player_stats || { goals: {}, assists: {} }
    };
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    // Update React state
    setActivities(updatedActivities);
    
    let success = false;
    
    // Try a direct update to the database first
    try {
      const updateData = {
        home_score: homeScore,
        away_score: awayScore,
        // IMPORTANT: Setting null for draw states in the database
        is_win: isWin === undefined ? null : isWin,
        result: result || null,
        league_id: activity.league_id, // Preserve league_id when updating
        player_stats: updatedActivity.player_stats // Include player_stats
      };
      
      console.log("Attempting direct Supabase update with data:", updateData);
      
      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', activityId);
        
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
            activityId, 
            `Match result updated directly: ${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'draw' : isWin}`
          );
          
          // Force refresh local cache to ensure data consistency
          localStorage.removeItem('cachedActivities');
          localStorage.removeItem('sb-activities-fetch-time');
          console.log("Cleared local cache after successful update");
          
          return true;
        } catch (logError) {
          console.warn("Couldn't log direct update to database:", logError);
          // Continue even if logging fails
        }
      }
    } catch (directUpdateError) {
      console.error("Error with direct update:", directUpdateError);
    }
    
    // If direct update fails, try with RLS handling approach as backup
    if (!success) {
      try {
        // Prepare minimal update data
        const updateData = {
          home_score: homeScore,
          away_score: awayScore,
          is_win: isWin === undefined ? null : isWin,
          result: result || null,
          player_stats: updatedActivity.player_stats,
          league_id: activity.league_id
        };
        
        console.log("Attempting RLS handling update with data:", updateData);
        
        const { success: rlsSuccess } = await updateActivityWithRLSHandling(updatedActivity.id, updateData);
        
        if (rlsSuccess) {
          console.log("Activity updated in database successfully via RLS handling");
          success = true;
          
          // Force refresh local cache to ensure data consistency
          localStorage.removeItem('cachedActivities');
          localStorage.removeItem('sb-activities-fetch-time');
          console.log("Cleared local cache after successful RLS update");
          
          return true;
        }
      } catch (error) {
        console.error("Failed to update activity with RLS handling:", error);
      }
    }

    // If all database updates failed, try fallback with storage system
    if (!success) {
      try {
        console.log("Attempting to save with storage system...");
        const saveSuccess = await saveActivities(updatedActivities);
        
        if (saveSuccess) {
          console.log("Activity saved successfully via enhanced storage system");
          success = true;
          
          // Force refresh local cache to ensure data consistency
          localStorage.removeItem('cachedActivities');
          localStorage.removeItem('sb-activities-fetch-time');
          console.log("Cleared local cache after successful storage update");
          
          return true;
        }
      } catch (saveError) {
        console.error("Enhanced storage system failed:", saveError);
      }
    }
    
    // If we reach here, no update method succeeded
    if (!success) {
      console.error("All update methods failed for activity", activityId);
      return false;
    }
    
    return success;
  } catch (error) {
    console.error("Error handling match result update:", error);
    toastLibrary.error("Ett fel uppstod vid uppdatering av matchresultat");
    return false;
  }
};
