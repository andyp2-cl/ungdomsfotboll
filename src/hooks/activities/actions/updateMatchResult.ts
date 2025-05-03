
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { updateActivityWithRLSHandling } from "@/lib/supabase";

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
    
    // Update the isWin status based on score
    if (homeScore !== undefined && awayScore !== undefined) {
      // Assume our team is the home team unless there's a clear indicator otherwise
      // In a more sophisticated setup, we would determine this based on team names
      const isHome = !activity.name.toLowerCase().includes(" borta");
      
      if (homeScore === awayScore) {
        // Draw
        updatedActivity.isWin = undefined;
      } else if (isHome) {
        // Home team - we win if home score > away score
        updatedActivity.isWin = homeScore > awayScore;
      } else {
        // Away team - we win if away score > home score
        updatedActivity.isWin = awayScore > homeScore;
      }
    }
    
    // Try database update
    try {
      console.log("Updating activity in database:", {
        id: updatedActivity.id,
        home_score: updatedActivity.homeScore,
        away_score: updatedActivity.awayScore,
        is_win: updatedActivity.isWin,
        result: updatedActivity.result
      });
      
      await updateActivityWithRLSHandling(updatedActivity);
      console.log("Activity updated in database");
    } catch (dbError) {
      console.error("Failed to update activity in database:", dbError);
      
      // Continue with local update even if db update failed
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
