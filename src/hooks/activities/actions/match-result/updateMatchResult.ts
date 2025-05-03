
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { toast as toastLibrary } from "sonner";
import { determineMatchOutcome } from "./determineOutcome";
import { updateMatchResultInDatabase } from "./updateDatabase";

/**
 * Updates match result (score) for an existing activity
 * Uses multiple approaches for maximum reliability
 * @returns Promise<boolean> indicating success or failure
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
    
    // Determine if Hässleholms IF won the match
    const isWin = determineMatchOutcome(activity, homeScore, awayScore);
    
    console.log(`Final activity data: scores=${homeScore}-${awayScore}, isWin=${isWin === undefined ? 'undefined (draw)' : isWin ? 'win' : 'loss'}`);
    
    // Create result string ONLY if both scores exist
    const result = (homeScore !== undefined && awayScore !== undefined)
      ? `${homeScore}-${awayScore}`
      : undefined;
    
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
    
    // Try to update in database
    let success = await updateMatchResultInDatabase(activity, homeScore, awayScore, isWin);

    // If database update failed, try fallback with storage system
    if (!success) {
      try {
        console.log("Attempting to save with storage system...");
        success = await saveActivities(updatedActivities);
        
        if (success) {
          console.log("Activity saved successfully via enhanced storage system");
          
          // Force refresh local cache to ensure data consistency
          localStorage.removeItem('cachedActivities');
          localStorage.removeItem('sb-activities-fetch-time');
          console.log("Cleared local cache after successful storage update");
          
          toastLibrary.success("Matchresultat sparat lokalt");
          return true;
        }
      } catch (saveError) {
        console.error("Enhanced storage system failed:", saveError);
      }
    }
    
    // If we reach here with success = true, one of the methods worked
    if (success) {
      // Additional cache clearing to ensure fresh data loads on next fetch
      localStorage.removeItem('cachedActivities');
      localStorage.removeItem('sb-activities-fetch-time');
      sessionStorage.removeItem('activities-cache');
      
      // Add a message to console to track successful saves
      console.log(`Successfully updated match result for activity ${activityId} with scores ${homeScore}-${awayScore}, isWin=${isWin}`);
      
      return true;
    }
    
    console.error("All update methods failed for activity", activityId);
    return false;
  } catch (error) {
    console.error("Error handling match result update:", error);
    toastLibrary.error("Ett fel uppstod vid uppdatering av matchresultat");
    return false;
  }
};
