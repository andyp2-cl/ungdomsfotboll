
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";

/**
 * Updates match result (score) for an existing activity
 * Uses a simplified approach focused on reliability
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
      console.error(`Activity not found: ${activityId}`);
      toast({
        title: "Kunde inte uppdatera matchresultat",
        description: "Matchen hittades inte.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a copy of the activity to avoid mutations
    const updatedActivity: Activity = { 
      ...activity,
      homeScore, 
      awayScore
    };
    
    // Add result string if both scores are defined
    if (homeScore !== undefined && awayScore !== undefined) {
      updatedActivity.result = `${homeScore}-${awayScore}`;
      
      // Set isWin based on scores (win = true, loss = false, draw = undefined)
      if (homeScore > awayScore) {
        updatedActivity.isWin = true;
      } else if (homeScore < awayScore) {
        updatedActivity.isWin = false;
      } else {
        // For a draw, set isWin to undefined (not false)
        updatedActivity.isWin = undefined;
      }
    } else {
      // Clear result if scores aren't defined
      updatedActivity.result = undefined;
      updatedActivity.isWin = undefined;
    }
    
    // Update player stats
    if (!updatedActivity.player_stats) {
      updatedActivity.player_stats = { goals: {}, assists: {} };
    }
    
    updatedActivity.player_stats = {
      ...updatedActivity.player_stats,
      scores: {
        home: homeScore,
        away: awayScore
      },
      isWin: updatedActivity.isWin
    };
    
    // Update local state first to give immediate feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    setActivities(updatedActivities);
    
    try {
      // Use the standard saveActivities helper 
      console.log("Saving match result to database...");
      await saveActivities([updatedActivity]);
      console.log("Match result saved successfully");
      
      toast({
        title: "Resultat uppdaterat",
        description: homeScore !== undefined && awayScore !== undefined ? 
          `Resultat uppdaterat: ${homeScore}-${awayScore}` : 
          "Resultat borttaget",
      });
    } catch (error) {
      console.error("Error saving match result:", error);
      
      toast({
        title: "Lokalt uppdaterad",
        description: "Resultatet har sparats lokalt, men kunde inte sparas i databasen. Försök igen senare.",
        variant: "warning"
      });
    }
  } catch (error: any) {
    console.error("Error in handleMatchResultUpdate:", error);
    toast({
      title: "Ett fel uppstod",
      description: `Kunde inte uppdatera matchresultatet: ${error?.message || "Okänt fel"}`,
      variant: "destructive"
    });
  }
};
