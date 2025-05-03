
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase";
import { isHomeMatch, calculateWinStatus } from "@/components/activity-detail/match-result/utils";
import { toast as toastLibrary } from "sonner";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity"; 
import { logDatabaseChange } from "@/lib/supabase/logs";

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
    
    // Create updated activity with new scores
    const updatedActivity: Activity = {
      ...activity,
      homeScore,
      awayScore,
      result: (homeScore !== undefined && awayScore !== undefined) ? `${homeScore}-${awayScore}` : undefined
    };
    
    // Determine if it's a home match
    const isHome = isHomeMatch(activity);
    
    // Update the isWin status based on score
    updatedActivity.isWin = calculateWinStatus(homeScore, awayScore, isHome);
    
    // Format the activity for database update
    const formattedActivity = formatActivityForDatabase(updatedActivity);
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    // Update React state
    setActivities(updatedActivities);
    
    // Prepare minimal update data to increase chances of success
    const updateData = {
      home_score: updatedActivity.homeScore,
      away_score: updatedActivity.awayScore,
      is_win: updatedActivity.isWin,
      result: updatedActivity.result
    };
    
    console.log("Updating activity in database:", {
      id: updatedActivity.id,
      ...updateData
    });

    // Try saving to local storage first as a reliable fallback
    try {
      await saveActivities(updatedActivities);
      console.log("Activity saved to local storage successfully");
      
      // Log local storage success to database
      try {
        await logDatabaseChange(
          'update', 
          'activity', 
          activityId, 
          `Match result updated locally: ${homeScore}-${awayScore}`
        );
      } catch (logError) {
        console.warn("Couldn't log local storage success to database:", logError);
      }
    } catch (localError) {
      console.error("Error saving to local storage:", localError);
    }

    // Then try updating with database approach
    try {
      // First attempt: minimal data update
      const { success, error } = await updateActivityWithRLSHandling(updatedActivity.id, updateData);
      
      if (success) {
        console.log("Activity updated in database successfully");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        
        // Log successful database update
        try {
          await logDatabaseChange(
            'update', 
            'activity', 
            activityId, 
            `Match result updated in database: ${homeScore}-${awayScore}`
          );
        } catch (logError) {
          console.warn("Couldn't log database update to logs table:", logError);
        }
      } else {
        console.error("Database update failed:", error);
        
        // Second attempt: try with just the score fields
        console.log("Attempting fallback update with only score fields");
        const scoreOnlyData = {
          home_score: updatedActivity.homeScore,
          away_score: updatedActivity.awayScore
        };
        
        const { success: scoreSuccess, error: scoreError } = await updateActivityWithRLSHandling(updatedActivity.id, scoreOnlyData);
        
        if (scoreSuccess) {
          console.log("Score fields updated successfully");
          toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
          
          // Log fallback success
          try {
            await logDatabaseChange(
              'update', 
              'activity', 
              activityId, 
              `Match result updated via fallback: ${homeScore}-${awayScore}`
            );
          } catch (logError) {
            console.warn("Couldn't log fallback success to database:", logError);
          }
        } else {
          console.error("Score-only update also failed:", scoreError);
          
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
                `Match result updated via full activity update: ${homeScore}-${awayScore}`
              );
            } catch (logError) {
              console.warn("Couldn't log backup success to database:", logError);
            }
          } else {
            console.error("All update methods failed", backupError || scoreError || error);
            
            // Log the failure
            try {
              await logDatabaseChange(
                'update', 
                'activity', 
                activityId, 
                `Failed to update match result in database: ${homeScore}-${awayScore}. Error: ${(backupError || scoreError || error)?.message || 'Unknown error'}`
              );
            } catch (logError) {
              console.warn("Couldn't log failure to database:", logError);
            }
            
            toastLibrary.warning("Resultatet sparades lokalt men kunde inte uppdateras i databasen");
          }
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
