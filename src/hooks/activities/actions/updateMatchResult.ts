
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { isHomeMatch, calculateWinStatus } from "@/components/activity-detail/match-result/utils";

/**
 * Updates match result for an activity
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
    console.log("handleMatchResultUpdate called:", { activityId, homeScore, awayScore });
    
    // Find the activity
    const activity = activities.find((a) => a.id === activityId);
    
    if (!activity) {
      console.error("Activity not found:", activityId);
      throw new Error("Activity not found");
    }
    
    // Determine if this is a home match
    const isHome = isHomeMatch(activity);
    
    // Calculate win status based on scores
    let isWin: boolean | undefined = undefined;
    if (homeScore !== undefined && awayScore !== undefined) {
      isWin = calculateWinStatus(homeScore, awayScore, isHome);
    }
    
    // Create the result string
    const resultString = homeScore !== undefined && awayScore !== undefined
      ? `${homeScore}-${awayScore}`
      : undefined;

    // Create updated activity with new scores
    const updatedActivity: Activity = {
      ...activity,
      homeScore,
      awayScore,
      result: resultString,
      isWin,
      player_stats: {
        ...(activity.player_stats || { goals: {}, assists: {} }),
        scores: {
          home: homeScore || 0,
          away: awayScore || 0
        },
        isWin
      }
    };
    
    console.log("Updated activity with results:", {
      id: updatedActivity.id,
      name: updatedActivity.name,
      homeScore,
      awayScore,
      isWin,
      result: resultString,
      cupId: updatedActivity.cupId
    });
    
    // If this is a cup match (has cupId), also update the cup's matches array
    if (updatedActivity.cupId) {
      const parentCup = activities.find(a => a.id === updatedActivity.cupId);
      if (parentCup && parentCup.type === 'cup') {
        console.log(`This is a cup match. Parent cup: ${parentCup.name}`);
        
        // Ensure cup has a matches array
        const updatedCup = { ...parentCup };
        if (!updatedCup.matches) {
          updatedCup.matches = [];
        }
        
        // Add match to cup if not already there
        if (!updatedCup.matches.includes(updatedActivity.id)) {
          console.log(`Adding match ${updatedActivity.id} to cup ${updatedCup.id}`);
          updatedCup.matches.push(updatedActivity.id);
          
          // Update activities array with updated cup
          activities = activities.map(a => 
            a.id === updatedCup.id ? updatedCup : a
          );
        }
      }
    }
    
    // Update activities array
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    
    // Update state first for immediate feedback
    setActivities(updatedActivities);
    
    // Then save to storage
    await saveActivities(updatedActivities);
    
    // Show success message
    toast({
      title: "Matchresultat sparat",
      description: resultString 
        ? `Resultat ${resultString} har sparats för ${activity.name}.` 
        : `Matchresultat har rensats för ${activity.name}.`,
    });
    
  } catch (error) {
    console.error("Error updating match result:", error);
    toast({
      title: "Ett fel uppstod",
      description: "Kunde inte spara matchresultat. Försök igen.",
      variant: "destructive"
    });
    throw error;
  }
};
