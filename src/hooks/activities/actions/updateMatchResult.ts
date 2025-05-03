
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase";
import { isHomeMatch, calculateWinStatus } from "@/components/activity-detail/match-result/utils";
import { toast as toastLibrary } from "sonner";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity"; 

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
        } else {
          console.error("Score-only update also failed:", scoreError);
          
          // Final attempt: try with full formatted activity
          const { success: backupSuccess, error: backupError } = await updateActivityWithRLSHandling(updatedActivity.id, formattedActivity);
          
          if (backupSuccess) {
            console.log("Activity updated successfully via backup method");
            toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
          } else {
            console.error("All update methods failed", backupError || scoreError || error);
            toastLibrary.warning("Resultatet sparades lokalt men kunde inte uppdateras i databasen");
          }
        }
      }
    } catch (dbError) {
      console.error("Failed to update activity in database:", dbError);
      toastLibrary.warning("Resultatet sparades lokalt men kunde inte uppdateras i databasen");
    }
  } catch (error) {
    console.error("Error handling match result update:", error);
    toastLibrary.error("Ett fel uppstod vid uppdatering av matchresultat");
    throw error; // Rethrow for handling by the caller
  }
};
