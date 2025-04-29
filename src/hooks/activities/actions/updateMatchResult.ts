
import { Activity } from "@/types/player";
import { saveActivities } from "@/utils/storage";
import { supabase } from "@/integrations/supabase/client";
import { formatActivityForDatabase } from "@/utils/database/formatters/activity";

/**
 * Updates match result (score) for an existing activity
 * Uses simple but reliable methods to ensure successful saving
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
    
    // Create the updated activity object
    const updatedActivity = { 
      ...activity,
      homeScore, 
      awayScore
    };
    
    // Add result string if both scores are defined
    if (homeScore !== undefined && awayScore !== undefined) {
      updatedActivity.result = `${homeScore}-${awayScore}`;
      
      // Set isWin based on scores
      updatedActivity.isWin = homeScore > awayScore;
    } else {
      // Clear result if scores aren't defined
      updatedActivity.result = undefined;
      updatedActivity.isWin = undefined;
    }
    
    // Update the player stats scores
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
    
    // Always update local state first to give immediate feedback
    const updatedActivities = activities.map(a => 
      a.id === activityId ? updatedActivity : a
    );
    setActivities(updatedActivities);
    
    try {
      // Use the standard saveActivities helper - the most reliable approach
      console.log("Using saveActivities helper to save match result");
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
      
      // Show an error message but don't revert local state
      // This way the user sees their changes even if the database save failed
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
