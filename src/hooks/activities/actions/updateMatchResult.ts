
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase";
import { isHomeMatch, calculateWinStatus } from "@/components/activity-detail/match-result/utils";

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
    
    // Try database update with more detailed logging
    try {
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
      
      // Call the enhanced RLS handling function with correct parameters
      const { success, error } = await updateActivityWithRLSHandling(updatedActivity.id, updateData);
      
      if (!success) {
        console.error("Database update failed:", error);
        toast.warning("Resultat sparades lokalt men kunde inte uppdateras i databasen");
      } else {
        console.log("Activity updated in database successfully");
      }
    } catch (dbError) {
      console.error("Failed to update activity in database:", dbError);
      toast.warning("Resultat sparades lokalt men kunde inte uppdateras i databasen");
    }
    
    // Always update local state
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    setActivities(updatedActivities);
    
    // Update local storage
    await saveActivities(updatedActivities);
    
    toast.success(`Matchresultat ${homeScore}-${awayScore} har sparats`);
  } catch (error) {
    console.error("Error handling match result update:", error);
    toast.error("Ett fel uppstod vid uppdatering av matchresultat");
  }
};
