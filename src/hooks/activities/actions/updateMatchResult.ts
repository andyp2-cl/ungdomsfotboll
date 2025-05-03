
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
      toast.error("Kunde inte hitta aktiviteten");
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
    
    // Directly update the local state first for immediate UI feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    // Update React state
    setActivities(updatedActivities);
    
    // Format the activity for database update
    const formattedActivity = formatActivityForDatabase(updatedActivity);
    
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

    // Try updating with simplified approach first
    try {
      const { success, error } = await updateActivityWithRLSHandling(updatedActivity.id, updateData);
      
      if (success) {
        console.log("Activity updated in database successfully");
        toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
      } else {
        console.error("Database update failed:", error);
        
        // Try with full formatted activity as fallback
        console.log("Attempting backup update with formatted activity");
        const { success: backupSuccess, error: backupError } = await updateActivityWithRLSHandling(updatedActivity.id, formattedActivity);
        
        if (backupSuccess) {
          console.log("Activity updated successfully via backup method");
          toastLibrary.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
        } else {
          console.error("Backup update method also failed:", backupError);
          
          // We'll still show success because the local state was updated
          // But warn that it's only local
          toastLibrary.warning("Resultat sparades lokalt men kunde inte uppdateras i databasen");
          throw new Error("Failed to update database: " + (backupError || error));
        }
      }
    } catch (dbError) {
      console.error("Failed to update activity in database:", dbError);
      
      // Show warning toast for database error
      toastLibrary.warning("Resultat sparades lokalt men kunde inte uppdateras i databasen");
      
      // Try to save to local storage as last resort
      await saveActivities(updatedActivities);
      
      // Rethrow for better error handling upstream
      throw dbError;
    }
  } catch (error) {
    console.error("Error handling match result update:", error);
    toastLibrary.error("Ett fel uppstod vid uppdatering av matchresultat");
    throw error; // Rethrow for handling by the caller
  }
};
