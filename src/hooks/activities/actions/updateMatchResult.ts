import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase/rls-handling";
import { isHomeMatch, calculateWinStatus, determineMatchOutcome } from "@/components/activity-detail/match-result/utils";
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
  awayScore?: number,
  isWin?: boolean
): Promise<void> => {
  try {
    console.log(`Updating match result for activity ${activityId}: ${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'undefined (draw)' : isWin ? 'win' : 'loss'}`);
    
    // Find the existing activity
    const activity = activities.find(a => a.id === activityId);
    
    if (!activity) {
      console.error(`Activity with id ${activityId} not found`);
      toastLibrary.error("Kunde inte hitta aktiviteten");
      return;
    }
    
    // Determine if it's a home match
    const isHome = isHomeMatch(activity);
    
    // If isWin is not explicitly provided, use our enhanced logic to determine the outcome
    if (isWin === undefined && homeScore !== undefined && awayScore !== undefined) {
      // For draws (equal scores), isWin will be undefined
      if (homeScore === awayScore) {
        isWin = undefined; // Draw
      } else {
        // Use the enhanced outcome determination logic
        const tempActivity = { ...activity, homeScore, awayScore };
        isWin = determineMatchOutcome(tempActivity);
        
        console.log(`Enhanced outcome determination for ${activity.name}: ${isWin === undefined ? 'draw' : isWin ? 'win' : 'loss'}`);
      }
    }
    
    console.log(`Activity ${activityId} (${activity.name}): home=${isHome}, scores=${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'undefined (draw)' : isWin ? 'win' : 'loss'}`);
    
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
    
    console.log("Updated activity with new result:", {
      id: updatedActivity.id,
      homeScore: updatedActivity.homeScore,
      awayScore: updatedActivity.awayScore,
      isWin: updatedActivity.isWin,
      result: updatedActivity.result,
      player_stats: updatedActivity.player_stats
    });
    
    // Format the activity for database update
    const formattedActivity = formatActivityForDatabase(updatedActivity);
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    // Update React state
    setActivities(updatedActivities);
    
    // Prepare minimal update data to increase chances of success
    // For draw status, we explicitly set is_win to null in the database
    const updateData = {
      home_score: updatedActivity.homeScore,
      away_score: updatedActivity.awayScore,
      is_win: updatedActivity.isWin === true ? true : updatedActivity.isWin === false ? false : null,
      result: updatedActivity.result,
      player_stats: updatedActivity.player_stats, // Make sure we're updating player_stats too
      league_id: activity.league_id // Preserve league_id when updating
    };
    
    console.log("Updating activity in database:", {
      id: updatedActivity.id,
      ...updateData,
      is_win_type: typeof updateData.is_win,
      is_win_value: updateData.is_win,
      player_stats: JSON.stringify(updateData.player_stats)
    });

    // Try a direct update to the database first
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          // IMPORTANT: Setting null for draw states in the database
          is_win: isWin === undefined ? null : isWin,
          result: (homeScore !== undefined && awayScore !== undefined) ? `${homeScore}-${awayScore}` : null,
          league_id: activity.league_id // Preserve league_id when updating
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
          return;
        } catch (logError) {
          console.warn("Couldn't log direct update to database:", logError);
        }
      }
    } catch (directUpdateError) {
      console.error("Error with direct update:", directUpdateError);
    }
    
    // If direct update fails, try the enhanced storage system
    try {
      // Save the updated activities array
      const saveSuccess = await saveActivities(updatedActivities);
      
      if (saveSuccess) {
        console.log("Activity saved successfully via enhanced storage system");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        
        // Log success to database
        try {
          await logDatabaseChange(
            'update', 
            'activity', 
            activityId, 
            `Match result updated using enhanced storage system: ${homeScore}-${awayScore}, isWin=${isWin}`
          );
        } catch (logError) {
          console.warn("Couldn't log success to database:", logError);
        }
        
        // No need for further attempts
        return;
      } else {
        console.warn("Enhanced storage system didn't report success, trying fallback methods");
      }
    } catch (saveError) {
      console.error("Enhanced storage system failed:", saveError);
      
      // Continue with fallback methods below
    }

    // Then try updating with RLS handling approach as another fallback
    try {
      const { success, error } = await updateActivityWithRLSHandling(updatedActivity.id, updateData);
      
      if (success) {
        console.log("Activity updated in database successfully via RLS handling");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        
        // Log successful database update
        try {
          await logDatabaseChange(
            'update', 
            'activity', 
            activityId, 
            `Match result updated in database: ${homeScore}-${awayScore}, isWin=${isWin}`
          );
        } catch (logError) {
          console.warn("Couldn't log database update to logs table:", logError);
        }
      } else {
        console.error("Database update failed:", error);
        
        // Final attempt: try with full formatted activity
        const { success: backupSuccess, error: backupError } = await updateActivityWithRLSHandling(updatedActivity.id, formattedActivity);
        
        if (backupSuccess) {
          console.log("Activity updated successfully via backup method");
          toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
          
          // Log backup success
          try {
            await logDatabaseChange(
              'update', 
              'activity', 
              activityId, 
              `Match result updated via full activity update: ${homeScore}-${awayScore}, isWin=${isWin}`
            );
          } catch (logError) {
            console.warn("Couldn't log backup success to database:", logError);
          }
        } else {
          console.error("All update methods failed", backupError || error);
          
          // Log the failure
          try {
            await logDatabaseChange(
              'error', 
              'activity', 
              activityId, 
              `Failed to update match result in database: ${homeScore}-${awayScore}, isWin=${isWin}. Error: ${(backupError || error)?.message || 'Unknown error'}`
            );
          } catch (logError) {
            console.warn("Couldn't log failure to database:", logError);
          }
          
          toastLibrary.warning("Resultatet sparades lokalt men kunde inte uppdateras i databasen");
        }
      }
    } catch (dbError) {
      console.error("Failed to update activity in database:", dbError);
      
      // Log database error
      try {
        await logDatabaseChange(
          'error', 
          'activity', 
          activityId, 
          `Error updating match result: ${dbError?.message || 'Unknown error'}`
        );
      } catch (logError) {
        console.warn("Couldn't log database error to logs table:", logError);
      }
      
      toastLibrary.warning("Resultatet sparades lokalt men kunde inte uppdateras i databasen");
    }
  } catch (error) {
    console.error("Error handling match result update:", error);
    toastLibrary.error("Ett fel uppstod vid uppdatering av matchresultat");
    
    // Log the overall error
    try {
      await logDatabaseChange(
        'error', 
        'activity', 
        activityId, 
        `Match result update failed with error: ${error?.message || 'Unknown error'}`
      );
    } catch (logError) {
      console.warn("Couldn't log error to database:", logError);
    }
    
    throw error; // Rethrow for handling by the caller
  }
};
