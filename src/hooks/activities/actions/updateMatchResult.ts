
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase/rls-handling";
import { isHomeMatch, extractTeamNames, isHassleholm, determineMatchOutcome } from "@/components/activity-detail/match-result/utils";
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
): Promise<void> => {
  try {
    console.log(`Updating match result for activity ${activityId}: ${homeScore}-${awayScore}`);
    
    // Find the existing activity
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      console.error(`Activity with id ${activityId} not found`);
      toastLibrary.error("Kunde inte hitta aktiviteten");
      return;
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
    
    console.log(`Activity ${activityId} (${activity.name}): scores=${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'undefined (draw)' : isWin ? 'win' : 'loss'}`);
    
    // Create updated activity with new scores, preserving existing player_stats
    const updatedActivity: Activity = {
      ...activity,
      homeScore,
      awayScore,
      isWin, // This will be true/false/undefined (undefined for draw)
      result: (homeScore !== undefined && awayScore !== undefined) ? `${homeScore}-${awayScore}` : undefined,
      // Ensure we preserve the player_stats when updating scores
      player_stats: activity.player_stats || { goals: {}, assists: {} }
    };
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    // Update React state
    setActivities(updatedActivities);
    
    // Try a direct update to the database first
    try {
      console.log("Attempting direct Supabase update with data:", {
        home_score: homeScore,
        away_score: awayScore,
        is_win: isWin === undefined ? null : isWin,
        result: (homeScore !== undefined && awayScore !== undefined) ? `${homeScore}-${awayScore}` : null,
        league_id: activity.league_id,
        player_stats: updatedActivity.player_stats
      });
      
      const { data, error } = await supabase
        .from('activities')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          // IMPORTANT: Setting null for draw states in the database
          is_win: isWin === undefined ? null : isWin,
          result: (homeScore !== undefined && awayScore !== undefined) ? `${homeScore}-${awayScore}` : null,
          league_id: activity.league_id, // Preserve league_id when updating
          player_stats: updatedActivity.player_stats // Important: Include player_stats
        })
        .eq('id', activityId);
        
      if (error) {
        console.error("Direct Supabase update failed:", error);
        toastLibrary.error("Direktuppdatering misslyckades");
      } else {
        console.log("Direct Supabase update succeeded!");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        
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
          
          return;
        } catch (logError) {
          console.warn("Couldn't log direct update to database:", logError);
        }
      }
    } catch (directUpdateError) {
      console.error("Error with direct update:", directUpdateError);
    }
    
    // If direct update fails, try saving activities with storage system
    try {
      const saveSuccess = await saveActivities(updatedActivities);
      
      if (saveSuccess) {
        console.log("Activity saved successfully via enhanced storage system");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        return;
      }
    } catch (saveError) {
      console.error("Enhanced storage system failed:", saveError);
    }

    // Last attempt - try with RLS handling approach
    try {
      // Prepare minimal update data
      const updateData = {
        home_score: updatedActivity.homeScore,
        away_score: updatedActivity.awayScore,
        is_win: updatedActivity.isWin === true ? true : updatedActivity.isWin === false ? false : null,
        result: updatedActivity.result,
        player_stats: updatedActivity.player_stats,
        league_id: activity.league_id
      };
      
      console.log("Attempting RLS handling update with data:", updateData);
      
      const { success } = await updateActivityWithRLSHandling(updatedActivity.id, updateData);
      
      if (success) {
        console.log("Activity updated in database successfully via RLS handling");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        
        // Force refresh local cache to ensure data consistency
        localStorage.removeItem('cachedActivities');
        localStorage.removeItem('sb-activities-fetch-time');
        
        return;
      } 
      
      // Final fallback - try with full formatted activity
      const { success: backupSuccess } = await updateActivityWithRLSHandling(
        updatedActivity.id, 
        formatActivityForDatabase(updatedActivity)
      );
      
      if (backupSuccess) {
        console.log("Activity updated successfully via backup method");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        
        // Force refresh local cache to ensure data consistency
        localStorage.removeItem('cachedActivities');
        localStorage.removeItem('sb-activities-fetch-time');
        
        return;
      }
      
      // If we get here, all database update attempts failed
      toastLibrary.warning("Resultatet sparades lokalt men kunde inte uppdateras i databasen");
      
    } catch (error) {
      console.error("Failed to update activity in database:", error);
      toastLibrary.warning("Resultatet sparades lokalt men kunde inte uppdateras i databasen");
    }
  } catch (error) {
    console.error("Error handling match result update:", error);
    toastLibrary.error("Ett fel uppstod vid uppdatering av matchresultat");
    throw error;
  }
};
