
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { normalizePlayerStats } from "../utils/playerStatsUtils";
import { isHomeMatch, calculateWinStatus } from "@/components/activity-detail/match-result/utils";

/**
 * Handles updating a match result for an activity
 */
export const handleMatchResultUpdate = async (
  activities: Activity[],
  setActivities: (activities: Activity[]) => void,
  toast: any,
  activityId: string, 
  homeScore?: number,
  awayScore?: number
) => {
  try {
    console.log("Updating match result for activity:", activityId, {homeScore, awayScore});
    
    // Create result string if both scores are defined
    const resultString = (homeScore !== undefined && awayScore !== undefined) 
      ? `${homeScore}-${awayScore}` 
      : undefined;
      
    // Find the current activity to get its data
    const currentActivity = activities.find(a => a.id === activityId);
    if (!currentActivity) {
      toast({
        title: "Fel",
        description: "Kunde inte hitta aktiviteten för att uppdatera resultatet.",
        variant: "destructive"
      });
      return;
    }

    // Determine if this is a home match for our team
    const isHome = isHomeMatch(currentActivity);
    
    // Calculate win status based on scores
    let isWin;
    if (homeScore !== undefined && awayScore !== undefined) {
      isWin = calculateWinStatus(homeScore, awayScore, isHome);
    }
    
    // Ensure player_stats is properly formatted
    const existingPlayerStats = normalizePlayerStats(currentActivity.player_stats);
    
    // Update the player_stats with new score data
    const updatedPlayerStats = {
      ...existingPlayerStats,
      goals: existingPlayerStats.goals || {},
      assists: existingPlayerStats.assists || {},
      scores: {
        home: homeScore,
        away: awayScore
      },
      isWin
    };
    
    console.log("Updated player stats with win status:", updatedPlayerStats);
    console.log("Is win calculated as:", isWin);
    
    // Update the activities array with the new result data
    const updatedActivities = activities.map(activity => 
      activity.id === activityId 
        ? { 
            ...activity, 
            result: resultString,
            homeScore, 
            awayScore,
            isWin,
            player_stats: updatedPlayerStats
          }
        : activity
    );
    
    // Update state and save to storage
    setActivities(updatedActivities);
    await saveActivities(updatedActivities);
    
    // Show success message
    toast({
      title: "Matchresultat uppdaterat",
      description: resultString 
        ? `Resultatet ${resultString} har sparats.`
        : "Matchresultatet har rensats.",
    });
  } catch (error) {
    console.error("Error updating match result:", error);
    toast({
      title: "Fel vid uppdatering av matchresultat",
      description: "Ett fel uppstod när resultatet skulle sparas. Försök igen.",
      variant: "destructive"
    });
  }
};
